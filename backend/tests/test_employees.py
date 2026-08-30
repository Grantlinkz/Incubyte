"""Integration tests for Employee CRUD, search, filter, pagination, and CSV export."""

import csv
import io
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Employee


def test_create_employee_success(client: TestClient) -> None:
    """Verify POST /api/employees creates employee and auto-computes USD salary."""
    payload = {
        "name": "Sarah Connor",
        "email": "sarah.connor@acme.com",
        "job_title": "Security Lead",
        "department": "Engineering",
        "country": "United States",
        "employment_type": "Full-time",
        "base_salary": 150000.0,
        "bonus": 20000.0,
        "currency": "USD",
        "status": "Active",
    }
    response = client.post("/api/employees", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Sarah Connor"
    assert data["salary_usd"] == 170000.0
    assert data["is_deleted"] is False


def test_create_employee_currency_fx_calculation(client: TestClient) -> None:
    """Verify POST /api/employees converts EUR to USD accurately."""
    payload = {
        "name": "Hans Gruber",
        "email": "hans.gruber@acme.com",
        "job_title": "Financial Analyst",
        "department": "Finance",
        "country": "Germany",
        "employment_type": "Full-time",
        "base_salary": 100000.0,
        "bonus": 10000.0,
        "currency": "EUR",
        "status": "Active",
    }
    response = client.post("/api/employees", json=payload)
    assert response.status_code == 201
    data = response.json()
    # (100,000 + 10,000) * 1.08 = 118,800.0 USD
    assert data["salary_usd"] == 118800.0


def test_create_employee_duplicate_email_conflict(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify POST /api/employees returns 400 when email already exists."""
    payload = {
        "name": "Alice Duplicate",
        "email": "alice.johnson@acme.com",  # Already in sample data
        "job_title": "Software Engineer",
        "department": "Engineering",
        "country": "United States",
        "employment_type": "Full-time",
        "base_salary": 120000.0,
        "bonus": 15000.0,
        "currency": "USD",
    }
    response = client.post("/api/employees", json=payload)
    assert response.status_code == 400


def test_get_employee_by_id_success(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify GET /api/employees/{id} returns single employee profile."""
    emp = sample_employees_data[0]
    response = client.get(f"/api/employees/{emp.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == emp.id
    assert data["name"] == emp.name
    assert data["email"] == emp.email


def test_get_employee_by_id_not_found(client: TestClient) -> None:
    """Verify GET /api/employees/{id} returns 404 for non-existent ID."""
    response = client.get("/api/employees/999999")
    assert response.status_code == 404


def test_get_employee_soft_deleted_returns_not_found(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify GET /api/employees/{id} returns 404 for soft-deleted employee."""
    # Former Employee is soft-deleted in sample data
    deleted_emp = sample_employees_data[-1]
    assert deleted_emp.is_deleted is True
    response = client.get(f"/api/employees/{deleted_emp.id}")
    assert response.status_code == 404


def test_update_employee_success(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify PUT /api/employees/{id} updates details and recalculates USD salary."""
    emp = sample_employees_data[0]
    update_payload = {
        "base_salary": 140000.0,
        "bonus": 20000.0,
        "job_title": "Principal Engineer",
    }
    response = client.put(f"/api/employees/{emp.id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["job_title"] == "Principal Engineer"
    assert data["base_salary"] == 140000.0
    assert data["bonus"] == 20000.0
    assert data["salary_usd"] == 160000.0


def test_soft_delete_employee(
    client: TestClient, sample_employees_data: list[Employee], db_session: Session
) -> None:
    """Verify DELETE /api/employees/{id} soft-deletes the record."""
    emp = sample_employees_data[0]
    del_response = client.delete(f"/api/employees/{emp.id}")
    assert del_response.status_code == 204

    # Subsequent GET must return 404
    get_response = client.get(f"/api/employees/{emp.id}")
    assert get_response.status_code == 404

    # Direct database check: record exists but is_deleted is True
    db_emp = db_session.query(Employee).filter(Employee.id == emp.id).first()
    assert db_emp is not None
    assert db_emp.is_deleted is True


def test_list_employees_pagination(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify GET /api/employees pagination boundaries."""
    # Active records in sample data = 5 (1 soft-deleted excluded)
    response = client.get("/api/employees?page=1&page_size=2")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total_pages"] == 3
    assert len(data["items"]) == 2


def test_list_employees_filter_by_department(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify filtering by department."""
    response = client.get("/api/employees?department=Engineering")
    assert response.status_code == 200
    data = response.json()
    # 2 active engineers (Alice, Bob), soft-deleted QA excluded
    assert data["total"] == 2
    for emp in data["items"]:
        assert emp["department"] == "Engineering"


def test_list_employees_filter_by_country(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify filtering by country."""
    response = client.get("/api/employees?country=Germany")
    assert response.status_code == 200
    data = response.json()
    # Claire and Elena
    assert data["total"] == 2
    for emp in data["items"]:
        assert emp["country"] == "Germany"


def test_list_employees_search_keyword(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify keyword search across name, email, and job title."""
    response = client.get("/api/employees?search=claire")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Claire Dubois"


def test_list_employees_sorting(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify sorting by salary_usd descending."""
    response = client.get("/api/employees?sort_by=salary_usd&sort_order=desc")
    assert response.status_code == 200
    data = response.json()
    salaries = [item["salary_usd"] for item in data["items"]]
    assert salaries == sorted(salaries, reverse=True)


def test_export_employees_csv(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify GET /api/employees/export streams valid CSV with correct headers and filtered rows."""
    response = client.get("/api/employees/export?department=Engineering")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "attachment; filename=" in response.headers.get("content-disposition", "")

    # Parse CSV output
    csv_reader = csv.reader(io.StringIO(response.text))
    rows = list(csv_reader)
    assert len(rows) >= 3  # Header row + 2 active engineers

    headers = rows[0]
    assert "id" in headers
    assert "name" in headers
    assert "email" in headers
    assert "salary_usd" in headers

    # Verify soft-deleted QA is excluded and only 2 engineers are returned
    engineering_emails = [r[headers.index("email")] for r in rows[1:]]
    assert "alice.johnson@acme.com" in engineering_emails
    assert "bob.smith@acme.com" in engineering_emails
    assert "former.employee@acme.com" not in engineering_emails
