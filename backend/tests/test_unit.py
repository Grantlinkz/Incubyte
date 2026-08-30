"""Unit tests for FX conversion matrix, Pydantic schemas, and mathematical calculations."""

import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.constants.fx_rates import (
    calculate_salary_usd,
    convert_to_usd,
)
from app.models import Employee
from app.schemas import EmployeeCreate, EmployeeUpdate, PaginatedResponse
from app.services.analytics_service import AnalyticsService


# ---------------------------------------------------------------------------
# 1. FX Rates & Conversion Matrix Unit Tests
# ---------------------------------------------------------------------------


def test_fx_conversion_supported_currencies() -> None:
    """Verify conversion to USD across all statically configured currencies."""
    assert convert_to_usd(100.0, "USD") == 100.0
    assert convert_to_usd(100.0, "EUR") == 108.0
    assert convert_to_usd(100.0, "GBP") == 128.0
    assert convert_to_usd(1000.0, "INR") == 12.0
    assert convert_to_usd(100.0, "CAD") == 74.0
    assert convert_to_usd(100.0, "AUD") == 66.0
    assert convert_to_usd(100.0, "SGD") == 75.0
    assert convert_to_usd(10000.0, "JPY") == 67.0
    assert convert_to_usd(1000000.0, "NGN") == 670.0


def test_fx_conversion_case_insensitivity_and_whitespace() -> None:
    """Verify convert_to_usd handles lowercase and leading/trailing whitespace."""
    assert convert_to_usd(100.0, "eur") == 108.0
    assert convert_to_usd(100.0, "  usd  ") == 100.0
    assert convert_to_usd(100.0, "gbp ") == 128.0


def test_fx_conversion_unsupported_currency() -> None:
    """Verify convert_to_usd raises ValueError for unrecognized currencies."""
    with pytest.raises(ValueError, match="Unsupported currency"):
        convert_to_usd(100.0, "XYZ")


def test_calculate_salary_usd() -> None:
    """Verify total compensation (base + bonus) converted to USD."""
    # (100,000 + 20,000) * 1.0 = 120,000 USD
    assert calculate_salary_usd(100000.0, 20000.0, "USD") == 120000.0
    # (80,000 + 10,000) * 1.08 = 97,200 EUR -> USD
    assert calculate_salary_usd(80000.0, 10000.0, "EUR") == 97200.0
    # Optional / zero bonus handling
    assert calculate_salary_usd(50000.0, 0.0, "USD") == 50000.0


# ---------------------------------------------------------------------------
# 2. Pydantic Schema Validation Unit Tests
# ---------------------------------------------------------------------------


def test_employee_create_valid() -> None:
    """Verify valid EmployeeCreate payload instantiates cleanly."""
    payload = {
        "name": "Jane Doe",
        "email": "jane.doe@acme.com",
        "job_title": "Software Engineer",
        "department": "Engineering",
        "country": "United States",
        "employment_type": "Full-time",
        "base_salary": 120000.0,
        "bonus": 15000.0,
        "currency": "USD",
        "status": "Active",
    }
    schema = EmployeeCreate(**payload)
    assert schema.name == "Jane Doe"
    assert schema.currency == "USD"
    assert schema.base_salary == 120000.0


def test_employee_create_currency_normalization() -> None:
    """Verify currency is auto-capitalized and stripped."""
    schema = EmployeeCreate(
        name="John Doe",
        email="john.doe@acme.com",
        job_title="Designer",
        department="Design",
        country="Germany",
        employment_type="Full-time",
        base_salary=80000.0,
        currency="  eur  ",
    )
    assert schema.currency == "EUR"


def test_employee_create_negative_salary_rejected() -> None:
    """Verify negative base_salary fails validation."""
    with pytest.raises(ValidationError):
        EmployeeCreate(
            name="John Doe",
            email="john.doe@acme.com",
            job_title="Designer",
            department="Design",
            country="Germany",
            employment_type="Full-time",
            base_salary=-5000.0,
            currency="EUR",
        )


def test_employee_create_negative_bonus_rejected() -> None:
    """Verify negative bonus fails validation."""
    with pytest.raises(ValidationError):
        EmployeeCreate(
            name="John Doe",
            email="john.doe@acme.com",
            job_title="Designer",
            department="Design",
            country="Germany",
            employment_type="Full-time",
            base_salary=50000.0,
            bonus=-100.0,
            currency="EUR",
        )


def test_employee_create_invalid_email_rejected() -> None:
    """Verify invalid email string fails custom email regex validator."""
    with pytest.raises(ValidationError):
        EmployeeCreate(
            name="John Doe",
            email="not-an-email",
            job_title="Designer",
            department="Design",
            country="Germany",
            employment_type="Full-time",
            base_salary=50000.0,
            currency="EUR",
        )


def test_employee_update_partial_valid() -> None:
    """Verify EmployeeUpdate permits partial field updates."""
    update_schema = EmployeeUpdate(base_salary=140000.0)
    data = update_schema.model_dump(exclude_unset=True)
    assert data == {"base_salary": 140000.0}


def test_paginated_response_schema() -> None:
    """Verify PaginatedResponse schema wraps list data correctly."""
    res = PaginatedResponse[str](
        items=["item1", "item2"],
        total=2,
        page=1,
        page_size=10,
        total_pages=1,
    )
    assert res.total == 2
    assert len(res.items) == 2


# ---------------------------------------------------------------------------
# 3. Exact Median Calculation Unit Tests
# ---------------------------------------------------------------------------


def test_median_empty_database(db_session: Session) -> None:
    """Verify AnalyticsService handles empty dataset without ZeroDivisionError."""
    summary = AnalyticsService.get_summary(db_session)
    assert summary.total_active_employees == 0
    assert summary.total_payroll_usd == 0.0
    assert summary.average_salary_usd == 0.0
    assert summary.median_salary_usd == 0.0
    assert summary.currency_distribution == []


def test_median_single_record(db_session: Session) -> None:
    """Verify median with single active employee equals that employee's salary."""
    emp = Employee(
        name="Solo",
        email="solo@acme.com",
        job_title="Dev",
        department="Engineering",
        country="United States",
        employment_type="Full-time",
        base_salary=100000.0,
        bonus=0.0,
        currency="USD",
        salary_usd=100000.0,
        status="Active",
        is_deleted=False,
    )
    db_session.add(emp)
    db_session.commit()

    summary = AnalyticsService.get_summary(db_session)
    assert summary.total_active_employees == 1
    assert summary.median_salary_usd == 100000.0
    assert summary.average_salary_usd == 100000.0


def test_median_odd_number_of_records(db_session: Session) -> None:
    """Verify median with odd count (3 records: 50k, 75k, 120k) selects exact middle element (75k)."""
    salaries = [50000.0, 75000.0, 120000.0]
    for i, sal in enumerate(salaries):
        db_session.add(
            Employee(
                name=f"Emp {i}",
                email=f"emp{i}@acme.com",
                job_title="Dev",
                department="Engineering",
                country="United States",
                employment_type="Full-time",
                base_salary=sal,
                bonus=0.0,
                currency="USD",
                salary_usd=sal,
                status="Active",
                is_deleted=False,
            )
        )
    db_session.commit()

    summary = AnalyticsService.get_summary(db_session)
    assert summary.total_active_employees == 3
    assert summary.median_salary_usd == 75000.0


def test_median_even_number_of_records(db_session: Session) -> None:
    """Verify median with even count (4 records: 40k, 60k, 80k, 100k) calculates mean of two middle elements (70k)."""
    salaries = [40000.0, 60000.0, 80000.0, 100000.0]
    for i, sal in enumerate(salaries):
        db_session.add(
            Employee(
                name=f"Emp {i}",
                email=f"emp{i}@acme.com",
                job_title="Dev",
                department="Engineering",
                country="United States",
                employment_type="Full-time",
                base_salary=sal,
                bonus=0.0,
                currency="USD",
                salary_usd=sal,
                status="Active",
                is_deleted=False,
            )
        )
    db_session.commit()

    summary = AnalyticsService.get_summary(db_session)
    assert summary.total_active_employees == 4
    # (60,000 + 80,000) / 2 = 70,000
    assert summary.median_salary_usd == 70000.0
