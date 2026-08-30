from typing import Annotated

from fastapi import APIRouter, Path, Query, status
from fastapi.responses import StreamingResponse

from app.database import SessionDep
from app.schemas import EmployeeCreate, EmployeeResponse, EmployeeUpdate, PaginatedResponse
from app.services.employee_service import EmployeeService

router = APIRouter(
    prefix="/api/employees",
    tags=["employees"],
)


@router.get(
    "",
    summary="List employees with filtering, searching, sorting, and pagination",
    response_model=PaginatedResponse[EmployeeResponse],
)
def list_employees(
    db: SessionDep,
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, description="Records per page")] = 50,
    search: Annotated[str | None, Query(description="Search across name, email, or job title")] = None,
    department: Annotated[str | None, Query(description="Filter by department")] = None,
    country: Annotated[str | None, Query(description="Filter by country")] = None,
    job_title: Annotated[str | None, Query(description="Filter by job title")] = None,
    employment_type: Annotated[str | None, Query(description="Filter by employment type")] = None,
    status_filter: Annotated[str | None, Query(alias="status", description="Filter by status")] = None,
    sort_by: Annotated[str, Query(description="Field to sort by")] = "id",
    sort_order: Annotated[str, Query(pattern="^(asc|desc)$", description="Sort direction (asc/desc)")] = "asc",
) -> PaginatedResponse[EmployeeResponse]:
    """Fetch paginated, filtered, and sorted employee records."""
    employees, total, total_pages = EmployeeService.list_employees(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        department=department,
        country=country,
        job_title=job_title,
        employment_type=employment_type,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return PaginatedResponse(
        items=[EmployeeResponse.model_validate(e) for e in employees],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new employee profile",
    response_model=EmployeeResponse,
)
def create_employee(
    db: SessionDep,
    employee_in: EmployeeCreate,
) -> EmployeeResponse:
    """Create a new employee profile with automatic USD base salary computation."""
    employee = EmployeeService.create_employee(db=db, employee_in=employee_in)
    return EmployeeResponse.model_validate(employee)


@router.get(
    "/export",
    summary="Stream filtered employees dataset as CSV file",
)
def export_employees_csv(
    db: SessionDep,
    search: Annotated[str | None, Query(description="Search across name, email, or job title")] = None,
    department: Annotated[str | None, Query(description="Filter by department")] = None,
    country: Annotated[str | None, Query(description="Filter by country")] = None,
    job_title: Annotated[str | None, Query(description="Filter by job title")] = None,
    employment_type: Annotated[str | None, Query(description="Filter by employment type")] = None,
    status_filter: Annotated[str | None, Query(alias="status", description="Filter by status")] = None,
    sort_by: Annotated[str, Query(description="Field to sort by")] = "id",
    sort_order: Annotated[str, Query(pattern="^(asc|desc)$", description="Sort direction (asc/desc)")] = "asc",
) -> StreamingResponse:
    """Stream filtered active employee records in CSV format."""
    generator = EmployeeService.stream_csv(
        db=db,
        search=search,
        department=department,
        country=country,
        job_title=job_title,
        employment_type=employment_type,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    headers = {
        "Content-Disposition": 'attachment; filename="employees_export.csv"',
        "Content-Type": "text/csv; charset=utf-8",
    }
    return StreamingResponse(generator, media_type="text/csv", headers=headers)


@router.get(
    "/{employee_id}",
    summary="Get single employee profile by ID",
    response_model=EmployeeResponse,
)
def get_employee(
    db: SessionDep,
    employee_id: Annotated[int, Path(ge=1, description="Employee ID")],
) -> EmployeeResponse:
    """Retrieve an active employee profile by ID."""
    employee = EmployeeService.get_employee_by_id(db=db, employee_id=employee_id)
    return EmployeeResponse.model_validate(employee)


@router.put(
    "/{employee_id}",
    summary="Update employee details",
    response_model=EmployeeResponse,
)
def update_employee(
    db: SessionDep,
    employee_id: Annotated[int, Path(ge=1, description="Employee ID")],
    employee_in: EmployeeUpdate,
) -> EmployeeResponse:
    """Update employee details and recalculate USD salary if compensation is modified."""
    employee = EmployeeService.update_employee(
        db=db,
        employee_id=employee_id,
        employee_in=employee_in,
    )
    return EmployeeResponse.model_validate(employee)


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft-delete employee profile",
)
def delete_employee(
    db: SessionDep,
    employee_id: Annotated[int, Path(ge=1, description="Employee ID")],
) -> None:
    """Soft-delete an employee profile."""
    EmployeeService.delete_employee(db=db, employee_id=employee_id)
