"""Integration tests for organizational analytics, compensation metrics, and aggregations."""

from fastapi.testclient import TestClient

from app.models import Employee


def test_analytics_summary_kpi(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify GET /api/analytics/summary returns accurate payroll, averages, medians, and currency distributions."""
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()

    # Active records in sample data:
    # 1. Alice: 135,000 USD
    # 2. Bob: 180,000 USD
    # 3. Claire: 102,600 USD (95,000 EUR * 1.08)
    # 4. David: 64,000 USD (50,000 GBP * 1.28)
    # 5. Elena: 54,000 USD (50,000 EUR * 1.08)
    # (Former Employee 110,000 USD is soft-deleted and must be excluded)
    # Total Payroll = 135k + 180k + 102.6k + 64k + 54k = 535,600.0 USD
    # Average = 535,600 / 5 = 107,120.0 USD
    # Sorted salaries: [54,000, 64,000, 102,600, 135,000, 180,000] -> Median = 102,600 USD

    assert data["total_active_employees"] == 5
    assert data["total_payroll_usd"] == 535600.0
    assert data["average_salary_usd"] == 107120.0
    assert data["median_salary_usd"] == 102600.0

    # Currency distributions: USD (2), EUR (2), GBP (1)
    currency_dist = {item["currency"]: item for item in data["currency_distribution"]}
    assert len(currency_dist) == 3
    assert currency_dist["USD"]["count"] == 2
    assert currency_dist["USD"]["percentage"] == 40.0
    assert currency_dist["EUR"]["count"] == 2
    assert currency_dist["EUR"]["percentage"] == 40.0
    assert currency_dist["GBP"]["count"] == 1
    assert currency_dist["GBP"]["percentage"] == 20.0


def test_analytics_by_department(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify GET /api/analytics/by-department groups by department accurately."""
    response = client.get("/api/analytics/by-department")
    assert response.status_code == 200
    data = response.json()

    # Engineering has 2 active employees (Alice 135k, Bob 180k = 315k)
    dept_map = {item["department"]: item for item in data}
    assert "Engineering" in dept_map
    assert dept_map["Engineering"]["headcount"] == 2
    assert dept_map["Engineering"]["total_payroll_usd"] == 315000.0
    assert dept_map["Engineering"]["average_salary_usd"] == 157500.0
    assert dept_map["Engineering"]["min_salary_usd"] == 135000.0
    assert dept_map["Engineering"]["max_salary_usd"] == 180000.0


def test_analytics_by_country(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify GET /api/analytics/by-country groups by country accurately."""
    response = client.get("/api/analytics/by-country")
    assert response.status_code == 200
    data = response.json()

    country_map = {item["country"]: item for item in data}
    assert "United States" in country_map
    assert country_map["United States"]["headcount"] == 2
    assert country_map["United States"]["total_payroll_usd"] == 315000.0

    assert "Germany" in country_map
    # Claire (102.6k) + Elena (54k) = 156.6k
    assert country_map["Germany"]["headcount"] == 2
    assert country_map["Germany"]["total_payroll_usd"] == 156600.0


def test_analytics_excludes_soft_deleted_dynamically(
    client: TestClient, sample_employees_data: list[Employee]
) -> None:
    """Verify that when an active employee is deleted, analytics reflect the removal immediately."""
    # Delete Bob (180,000 USD)
    bob = next(e for e in sample_employees_data if e.name == "Bob Smith")
    del_res = client.delete(f"/api/employees/{bob.id}")
    assert del_res.status_code == 204

    # Summary should now have 4 active employees and 535,600 - 180,000 = 355,600 USD
    summary_res = client.get("/api/analytics/summary")
    assert summary_res.status_code == 200
    data = summary_res.json()
    assert data["total_active_employees"] == 4
    assert data["total_payroll_usd"] == 355600.0
    # Sorted remaining: [54,000, 64,000, 102,600, 135,000] -> Median = (64,000 + 102,600) / 2 = 83,300.0 USD
    assert data["median_salary_usd"] == 83300.0
