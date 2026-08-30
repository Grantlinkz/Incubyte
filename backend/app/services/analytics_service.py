"""Analytics service layer providing SQL-level aggregations and compensation metrics."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Employee
from app.schemas import (
    AnalyticsSummaryResponse,
    CountryAnalyticsItem,
    CurrencyDistributionItem,
    DepartmentAnalyticsItem,
)


class AnalyticsService:
    """Service encapsulating organizational compensation metrics, medians, and aggregations."""

    @staticmethod
    def get_summary(db: Session) -> AnalyticsSummaryResponse:
        """Calculate executive KPI summary (total payroll, average, exact median, and currency distribution)."""
        # 1. Total headcount, total payroll USD, and average salary USD
        stmt = select(
            func.count(Employee.id),
            func.sum(Employee.salary_usd),
            func.avg(Employee.salary_usd),
        ).where(Employee.is_deleted == False)  # noqa: E712

        row = db.execute(stmt).one()
        total_active_employees: int = row[0] or 0
        total_payroll_usd: float = round(float(row[1] or 0.0), 2)
        average_salary_usd: float = round(float(row[2] or 0.0), 2)

        # 2. Exact median salary calculation using index-accelerated offset query
        median_salary_usd: float = 0.0
        if total_active_employees > 0:
            if total_active_employees % 2 == 1:
                # Odd count: middle single element
                offset = (total_active_employees - 1) // 2
                median_stmt = (
                    select(Employee.salary_usd)
                    .where(Employee.is_deleted == False)  # noqa: E712
                    .order_by(Employee.salary_usd.asc())
                    .offset(offset)
                    .limit(1)
                )
                val = db.scalar(median_stmt)
                median_salary_usd = round(float(val or 0.0), 2)
            else:
                # Even count: average of the two middle elements
                offset = (total_active_employees // 2) - 1
                median_stmt = (
                    select(Employee.salary_usd)
                    .where(Employee.is_deleted == False)  # noqa: E712
                    .order_by(Employee.salary_usd.asc())
                    .offset(offset)
                    .limit(2)
                )
                middle_values = list(db.scalars(median_stmt).all())
                if len(middle_values) == 2:
                    median_salary_usd = round(float(sum(middle_values) / 2.0), 2)
                elif middle_values:
                    median_salary_usd = round(float(middle_values[0]), 2)

        # 3. Currency distribution breakdown
        currency_stmt = (
            select(Employee.currency, func.count(Employee.id))
            .where(Employee.is_deleted == False)  # noqa: E712
            .group_by(Employee.currency)
            .order_by(func.count(Employee.id).desc())
        )
        currency_rows = db.execute(currency_stmt).all()
        currency_distribution: list[CurrencyDistributionItem] = [
            CurrencyDistributionItem(
                currency=c_row[0],
                count=c_row[1],
                percentage=round((c_row[1] / total_active_employees * 100.0), 2)
                if total_active_employees > 0
                else 0.0,
            )
            for c_row in currency_rows
        ]

        return AnalyticsSummaryResponse(
            total_payroll_usd=total_payroll_usd,
            average_salary_usd=average_salary_usd,
            median_salary_usd=median_salary_usd,
            total_active_employees=total_active_employees,
            currency_distribution=currency_distribution,
        )

    @staticmethod
    def get_by_department(db: Session) -> list[DepartmentAnalyticsItem]:
        """Aggregate compensation and headcount metrics grouped by department."""
        stmt = (
            select(
                Employee.department,
                func.count(Employee.id),
                func.sum(Employee.salary_usd),
                func.avg(Employee.salary_usd),
                func.min(Employee.salary_usd),
                func.max(Employee.salary_usd),
            )
            .where(Employee.is_deleted == False)  # noqa: E712
            .group_by(Employee.department)
            .order_by(func.sum(Employee.salary_usd).desc())
        )
        rows = db.execute(stmt).all()

        return [
            DepartmentAnalyticsItem(
                department=row[0],
                headcount=row[1],
                total_payroll_usd=round(float(row[2] or 0.0), 2),
                average_salary_usd=round(float(row[3] or 0.0), 2),
                min_salary_usd=round(float(row[4] or 0.0), 2),
                max_salary_usd=round(float(row[5] or 0.0), 2),
            )
            for row in rows
        ]

    @staticmethod
    def get_by_country(db: Session) -> list[CountryAnalyticsItem]:
        """Aggregate compensation and headcount metrics grouped by country / region."""
        stmt = (
            select(
                Employee.country,
                func.count(Employee.id),
                func.sum(Employee.salary_usd),
                func.avg(Employee.salary_usd),
                func.min(Employee.salary_usd),
                func.max(Employee.salary_usd),
            )
            .where(Employee.is_deleted == False)  # noqa: E712
            .group_by(Employee.country)
            .order_by(func.sum(Employee.salary_usd).desc())
        )
        rows = db.execute(stmt).all()

        return [
            CountryAnalyticsItem(
                country=row[0],
                headcount=row[1],
                total_payroll_usd=round(float(row[2] or 0.0), 2),
                average_salary_usd=round(float(row[3] or 0.0), 2),
                min_salary_usd=round(float(row[4] or 0.0), 2),
                max_salary_usd=round(float(row[5] or 0.0), 2),
            )
            for row in rows
        ]
