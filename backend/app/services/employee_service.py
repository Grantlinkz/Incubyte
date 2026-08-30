from collections.abc import Generator
import csv
from datetime import datetime, timezone
import io
import math
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.constants.fx_rates import calculate_salary_usd
from app.models import Employee
from app.schemas import EmployeeCreate, EmployeeUpdate

ALLOWED_SORT_FIELDS: dict[str, Any] = {
    "id": Employee.id,
    "name": Employee.name,
    "email": Employee.email,
    "job_title": Employee.job_title,
    "department": Employee.department,
    "country": Employee.country,
    "employment_type": Employee.employment_type,
    "base_salary": Employee.base_salary,
    "bonus": Employee.bonus,
    "currency": Employee.currency,
    "salary_usd": Employee.salary_usd,
    "status": Employee.status,
    "created_at": Employee.created_at,
    "updated_at": Employee.updated_at,
}


def _build_employee_query(
    search: str | None = None,
    department: str | None = None,
    country: str | None = None,
    job_title: str | None = None,
    employment_type: str | None = None,
    status_filter: str | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
):
    """Construct filtered and sorted SQLAlchemy select query for active employees."""
    query = select(Employee).where(Employee.is_deleted == False)  # noqa: E712

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Employee.name.ilike(term),
                Employee.email.ilike(term),
                Employee.job_title.ilike(term),
            )
        )

    if department and department.strip():
        query = query.where(Employee.department == department.strip())

    if country and country.strip():
        query = query.where(Employee.country == country.strip())

    if job_title and job_title.strip():
        query = query.where(Employee.job_title == job_title.strip())

    if employment_type and employment_type.strip():
        query = query.where(Employee.employment_type == employment_type.strip())

    if status_filter and status_filter.strip():
        query = query.where(Employee.status == status_filter.strip())

    # Sorting
    sort_column = ALLOWED_SORT_FIELDS.get(sort_by.lower(), Employee.id)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    return query


class EmployeeService:
    """Service layer for employee CRUD, filtering, pagination, and streaming export."""

    @staticmethod
    def list_employees(
        db: Session,
        page: int = 1,
        page_size: int = 50,
        search: str | None = None,
        department: str | None = None,
        country: str | None = None,
        job_title: str | None = None,
        employment_type: str | None = None,
        status_filter: str | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ) -> tuple[list[Employee], int, int]:
        """Fetch paginated, filtered, and sorted employee records."""
        base_query = _build_employee_query(
            search=search,
            department=department,
            country=country,
            job_title=job_title,
            employment_type=employment_type,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        # Efficient count query
        count_stmt = select(func.count()).select_from(base_query.order_by(None).subquery())
        total = db.scalar(count_stmt) or 0

        # Calculate pagination
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        offset = (page - 1) * page_size

        # Paginated fetch
        paginated_stmt = base_query.offset(offset).limit(page_size)
        employees = list(db.scalars(paginated_stmt).all())

        return employees, total, total_pages

    @staticmethod
    def get_employee_by_id(db: Session, employee_id: int) -> Employee:
        """Fetch single active employee by ID."""
        employee = db.scalar(
            select(Employee).where(
                Employee.id == employee_id,
                Employee.is_deleted == False,  # noqa: E712
            )
        )
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found.",
            )
        return employee

    @staticmethod
    def create_employee(db: Session, employee_in: EmployeeCreate) -> Employee:
        """Create new employee with email uniqueness validation and USD salary computation."""
        # Check email uniqueness among active records
        existing = db.scalar(
            select(Employee).where(
                Employee.email == employee_in.email,
                Employee.is_deleted == False,  # noqa: E712
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee with email '{employee_in.email}' already exists.",
            )

        salary_usd = calculate_salary_usd(
            base_salary=employee_in.base_salary,
            bonus=employee_in.bonus,
            currency=employee_in.currency,
        )

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        employee = Employee(
            name=employee_in.name,
            email=employee_in.email,
            job_title=employee_in.job_title,
            department=employee_in.department,
            country=employee_in.country,
            employment_type=employee_in.employment_type,
            base_salary=employee_in.base_salary,
            bonus=employee_in.bonus,
            currency=employee_in.currency,
            salary_usd=salary_usd,
            status=employee_in.status,
            is_deleted=False,
            created_at=now,
            updated_at=now,
        )
        db.add(employee)
        db.commit()
        db.refresh(employee)
        return employee

    @staticmethod
    def update_employee(db: Session, employee_id: int, employee_in: EmployeeUpdate) -> Employee:
        """Update existing employee details and recalculate USD salary if compensation changes."""
        employee = EmployeeService.get_employee_by_id(db, employee_id)

        update_data = employee_in.model_dump(exclude_unset=True)

        # If email is being changed, verify uniqueness
        if "email" in update_data and update_data["email"] != employee.email:
            existing = db.scalar(
                select(Employee).where(
                    Employee.email == update_data["email"],
                    Employee.id != employee_id,
                    Employee.is_deleted == False,  # noqa: E712
                )
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Employee with email '{update_data['email']}' already exists.",
                )

        # Apply updates
        for field, value in update_data.items():
            setattr(employee, field, value)

        # Recalculate salary_usd if base_salary, bonus, or currency changed
        if any(f in update_data for f in ("base_salary", "bonus", "currency")):
            employee.salary_usd = calculate_salary_usd(
                base_salary=employee.base_salary,
                bonus=employee.bonus,
                currency=employee.currency,
            )

        employee.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
        db.refresh(employee)
        return employee

    @staticmethod
    def delete_employee(db: Session, employee_id: int) -> None:
        """Soft-delete an employee profile."""
        employee = EmployeeService.get_employee_by_id(db, employee_id)
        employee.is_deleted = True
        employee.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()

    @staticmethod
    def stream_csv(
        db: Session,
        search: str | None = None,
        department: str | None = None,
        country: str | None = None,
        job_title: str | None = None,
        employment_type: str | None = None,
        status_filter: str | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
        chunk_size: int = 1000,
    ) -> Generator[str, None, None]:
        """Stream filtered active employee records formatted as CSV in lightweight chunks."""
        query = _build_employee_query(
            search=search,
            department=department,
            country=country,
            job_title=job_title,
            employment_type=employment_type,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        headers = [
            "id",
            "name",
            "email",
            "job_title",
            "department",
            "country",
            "employment_type",
            "base_salary",
            "bonus",
            "currency",
            "salary_usd",
            "status",
            "created_at",
            "updated_at",
        ]

        # Yield CSV header row
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        # Stream records in chunks
        offset = 0
        while True:
            chunk = db.scalars(query.offset(offset).limit(chunk_size)).all()
            if not chunk:
                break

            for emp in chunk:
                writer.writerow(
                    [
                        emp.id,
                        emp.name,
                        emp.email,
                        emp.job_title,
                        emp.department,
                        emp.country,
                        emp.employment_type,
                        f"{emp.base_salary:.2f}",
                        f"{emp.bonus:.2f}",
                        emp.currency,
                        f"{emp.salary_usd:.2f}",
                        emp.status,
                        emp.created_at.isoformat() if emp.created_at else "",
                        emp.updated_at.isoformat() if emp.updated_at else "",
                    ]
                )
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)
            offset += chunk_size
