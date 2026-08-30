"""Shared Pytest fixtures for in-memory SQLite database and FastAPI TestClient."""

from collections.abc import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Employee

# Create in-memory SQLite engine with StaticPool for thread-safe test isolation
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create fresh in-memory database tables for each test function and tear down after."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Provide a TestClient with get_db dependency overridden to use in-memory SQLite session."""

    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sample_employees_data(db_session: Session) -> list[Employee]:
    """Seed deterministic sample employee dataset for integration testing."""
    employees = [
        Employee(
            name="Alice Johnson",
            email="alice.johnson@acme.com",
            job_title="Software Engineer",
            department="Engineering",
            country="United States",
            employment_type="Full-time",
            base_salary=120000.0,
            bonus=15000.0,
            currency="USD",
            salary_usd=135000.0,
            status="Active",
            is_deleted=False,
        ),
        Employee(
            name="Bob Smith",
            email="bob.smith@acme.com",
            job_title="Senior Software Engineer",
            department="Engineering",
            country="United States",
            employment_type="Full-time",
            base_salary=160000.0,
            bonus=20000.0,
            currency="USD",
            salary_usd=180000.0,
            status="Active",
            is_deleted=False,
        ),
        Employee(
            name="Claire Dubois",
            email="claire.dubois@acme.com",
            job_title="Product Manager",
            department="Product",
            country="Germany",
            employment_type="Full-time",
            base_salary=85000.0,
            bonus=10000.0,
            currency="EUR",
            salary_usd=102600.0,  # 95,000 * 1.08 = 102,600.0
            status="Active",
            is_deleted=False,
        ),
        Employee(
            name="David Miller",
            email="david.miller@acme.com",
            job_title="UI/UX Designer",
            department="Design",
            country="United Kingdom",
            employment_type="Contractor",
            base_salary=50000.0,
            bonus=0.0,
            currency="GBP",
            salary_usd=64000.0,  # 50,000 * 1.28 = 64,000.0
            status="Active",
            is_deleted=False,
        ),
        Employee(
            name="Elena Rostova",
            email="elena.rostova@acme.com",
            job_title="HR Specialist",
            department="Human Resources",
            country="Germany",
            employment_type="Part-time",
            base_salary=45000.0,
            bonus=5000.0,
            currency="EUR",
            salary_usd=54000.0,  # 50,000 * 1.08 = 54,000.0
            status="On Leave",
            is_deleted=False,
        ),
        Employee(
            name="Former Employee",
            email="former.employee@acme.com",
            job_title="QA Engineer",
            department="Engineering",
            country="United States",
            employment_type="Full-time",
            base_salary=100000.0,
            bonus=10000.0,
            currency="USD",
            salary_usd=110000.0,
            status="Terminated",
            is_deleted=True,  # Soft-deleted record for exclusion testing
        ),
    ]
    db_session.add_all(employees)
    db_session.commit()
    for emp in employees:
        db_session.refresh(emp)
    return employees
