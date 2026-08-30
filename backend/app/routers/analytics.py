"""FastAPI router for organizational compensation analytics and reporting."""

from fastapi import APIRouter

from app.database import SessionDep
from app.schemas import (
    AnalyticsSummaryResponse,
    CountryAnalyticsItem,
    DepartmentAnalyticsItem,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"],
)


@router.get(
    "/summary",
    summary="Executive KPI compensation summary",
    response_model=AnalyticsSummaryResponse,
)
def get_analytics_summary(
    db: SessionDep,
) -> AnalyticsSummaryResponse:
    """Retrieve executive compensation KPIs including total annual payroll, average, exact median, and currency distribution."""
    return AnalyticsService.get_summary(db=db)


@router.get(
    "/by-department",
    summary="Departmental compensation and headcount breakdown",
    response_model=list[DepartmentAnalyticsItem],
)
def get_department_analytics(
    db: SessionDep,
) -> list[DepartmentAnalyticsItem]:
    """Retrieve compensation metrics (headcount, payroll, average, min, max) grouped by department."""
    return AnalyticsService.get_by_department(db=db)


@router.get(
    "/by-country",
    summary="Geographic compensation and headcount breakdown",
    response_model=list[CountryAnalyticsItem],
)
def get_country_analytics(
    db: SessionDep,
) -> list[CountryAnalyticsItem]:
    """Retrieve compensation metrics (headcount, payroll, average, min, max) grouped by country / region."""
    return AnalyticsService.get_by_country(db=db)
