# Phase 5 Implementation Prompt: Testing & CI Readiness

## Goal
Implement a comprehensive, deterministic test suite using `pytest` and FastAPI's `TestClient` (via `httpx`). The suite will include isolated unit tests for currency conversion matrix logic, median calculations, and Pydantic validation rules, as well as end-to-end integration tests covering employee CRUD, pagination, filtering, full-text search, CSV export streaming, and organizational analytics.

---

## Skills Read
- `.agents/skills/fastapi/SKILL.md` — FastAPI conventions, dependency injection overrides (`app.dependency_overrides`), `Annotated` typing, and test execution standards.

---

## Existing Code Inspected
- `app/config.py` & `app/database.py` — Engine setup, session dependency (`get_db`, `SessionDep`).
- `app/constants/fx_rates.py` — Static FX conversion lookup dictionary and `convert_to_usd` helper.
- `app/models.py` — SQLAlchemy `Employee` model with soft-delete and composite indexes.
- `app/schemas.py` — Pydantic request/response models and validators.
- `app/services/employee_service.py` — CRUD operations, multi-attribute filtering, search, pagination, and CSV streaming generator.
- `app/services/analytics_service.py` — Summary KPIs, SQL aggregations, and sorted exact median calculations.
- `app/routers/employees.py` & `app/routers/analytics.py` — API route handlers.
- `assesesment details/Backend Implementation Plan.pdf` & `context/progress-tracker.md`.

---

## Decisions & Assumptions
1. **Isolated In-Memory SQLite Database for Integration Tests**:
   - Tests will use `sqlite:///:memory:` (or isolated SQLite test database with `StaticPool`) to ensure fast, isolated, zero-side-effect test executions.
   - `conftest.py` will configure SQLAlchemy `Base.metadata.create_all` and override `get_db` using `app.dependency_overrides[get_db]`.
2. **Fast & Deterministic Unit Tests**:
   - `tests/test_unit.py`: Pure unit tests verifying FX conversions across all supported currencies, fallback handling, edge cases in median calculations (empty DB, 1 item, odd count, even count, duplicate values), and Pydantic validation boundaries (negative salaries, invalid currency format, bad email addresses).
3. **Comprehensive Endpoint Coverage (`TestClient`)**:
   - `tests/test_employees.py`: Covers `POST`, `GET`, `PUT`, `DELETE` (soft-delete verification), `GET /api/employees` (pagination, search, filtering by department/country/status/employment_type, sorting asc/desc), and `GET /api/employees/export` (CSV header validation, streamed rows, filter preservation).
   - `tests/test_analytics.py`: Covers `/api/analytics/summary`, `/api/analytics/by-department`, and `/api/analytics/by-country`, verifying soft-deleted record exclusion and mathematical precision.

---

## Files Likely to Change
- `[NEW] tests/__init__.py` — Package initializer.
- `[NEW] tests/conftest.py` — Test fixtures, in-memory SQLite engine, session rollback/override, and `TestClient` fixture.
- `[NEW] tests/test_unit.py` — Unit tests for FX conversion, Pydantic schemas, and mathematical calculations.
- `[NEW] tests/test_employees.py` — Integration tests for employee CRUD, search, filter, pagination, and streaming CSV export.
- `[NEW] tests/test_analytics.py` — Integration tests for summary KPIs, departmental breakdowns, and country aggregations.
- `[MODIFY] context/progress-tracker.md` — Update status to Phase 5 completed.

---

## Implementation Requirements

### 1. `tests/conftest.py`
- Create an in-memory SQLite engine: `create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)`.
- Set up `TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)`.
- Fixture `db_session`: Creates tables (`Base.metadata.create_all(bind=test_engine)`), yields session, drops tables (`Base.metadata.drop_all(bind=test_engine)`).
- Fixture `client`: Overrides `get_db` dependency on `app` and yields `TestClient(app)`.
- Fixture `sample_employees_data`: Pre-populates a deterministic dataset of active and soft-deleted employees across various countries, departments, and currencies.

### 2. `tests/test_unit.py`
- Test `convert_to_usd`:
  - Standard conversions (USD 1.0, EUR 1.08, GBP 1.28, CAD 0.74, AUD 0.66, JPY 0.0067, INR 0.012, etc.).
  - Unknown currency fallback (returns original amount).
  - Positive rounding / precision checks.
- Test `EmployeeCreate` / `EmployeeUpdate` Pydantic schemas:
  - Valid payload succeeds.
  - Negative `base_salary` or `bonus` raises `ValidationError`.
  - Invalid currency code raises `ValidationError`.
  - Invalid email raises `ValidationError`.
- Test `AnalyticsService.calculate_median`:
  - Odd number of elements.
  - Even number of elements (average of two middle items).
  - Single element.
  - Empty dataset (returns 0.0).

### 3. `tests/test_employees.py`
- `test_create_employee`: Creates employee and verifies `salary_usd` is automatically populated correctly.
- `test_get_employee_by_id`: Fetches created employee; verifies 404 for non-existent ID.
- `test_update_employee`: Updates salary and department, verifies `salary_usd` recalculated.
- `test_soft_delete_employee`: Deletes employee, verifies status 200, and verifies subsequent `GET` returns 404 and is excluded from active list.
- `test_list_employees_pagination`: Tests `page=1, page_size=2`, `page=2`, verifying total count and items length.
- `test_list_employees_filtering`: Filters by `department`, `country`, `employment_type`, `status`.
- `test_list_employees_search`: Searches by name or email keyword.
- `test_list_employees_sorting`: Sorts by `base_salary` ASC and DESC.
- `test_export_employees_csv`: Requests `/api/employees/export`, verifies headers `Content-Disposition`, parses returned CSV rows and columns.

### 4. `tests/test_analytics.py`
- `test_analytics_summary`: Verifies total payroll, average, median, active count, and currency distribution percentage totals.
- `test_analytics_by_department`: Verifies departmental metrics (headcount, total_payroll, min, max, avg).
- `test_analytics_by_country`: Verifies geographic metrics.
- `test_analytics_excludes_soft_deleted`: Soft-deletes a high-earner employee, asserts total payroll and averages update accurately without the deleted record.

---

## Acceptance Criteria
- [ ] All unit and integration tests run via `.venv\Scripts\pytest` and pass 100% with zero failures or warnings.
- [ ] In-memory test environment isolated from production/development `salary_management.db`.
- [ ] Soft deletion exclusion tested across every service and API endpoint.
- [ ] Edge cases (empty results, zero divisions, invalid inputs, search misses) gracefully handled.

---

## Checks to Run
1. Run `.venv\Scripts\pytest -v` across all test modules.
2. Verify all assertions pass deterministically.

---

## Atomic Git Commit Breakdown (Phase 5)
1. **Commit 1**: `tests(unit): add unit tests for fx conversion, median calculations, and pydantic validation`
   - Files: `tests/__init__.py`, `tests/conftest.py`, `tests/test_unit.py`
2. **Commit 2**: `tests(integration): add testclient integration tests for crud, filters, exports, and analytics`
   - Files: `tests/test_employees.py`, `tests/test_analytics.py`, `context/progress-tracker.md`
