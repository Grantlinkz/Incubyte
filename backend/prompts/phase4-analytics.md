# Phase 4 Implementation Prompt: Analytics & Aggregations

## Goal
Implement high-performance SQL analytics and compensation aggregation services for executive reporting ("How ACME Pays"). This includes executive KPI summary (total annual payroll, average salary, exact median salary, and currency distribution), departmental breakdowns, and geographic breakdowns across international offices.

---

## Skills Read
- `.agents/skills/fastapi/SKILL.md` — Annotated dependency injection (`SessionDep`), explicit return types, APIRouter prefix and tags configuration, avoiding `RootModel` and ellipsis.

---

## Existing Code Inspected
- `app/models.py` — `Employee` model with indexed columns (`is_deleted`, `department`, `country`, `salary_usd`) and composite indexes (`ix_employees_active_dept_country`, `ix_employees_active_salary`).
- `app/schemas.py` — Pydantic models for validation and responses.
- `app/database.py` — SQLite WAL configuration and `SessionDep` dependency.
- `app/main.py` — Router mounting and application lifespan.
- `context/AGENTS.md`, `context/architecture.md`, `context/progress-tracker.md`, `context/ui-context.md`.

---

## Decisions & Assumptions
1. **Universal Soft-Delete Filtering**: All aggregation queries must explicitly filter `Employee.is_deleted == False`.
2. **Exact Median Calculation**: Since SQLite lacks a native `MEDIAN()` aggregation function, calculate exact median using the active count `N` and index-accelerated `OFFSET / LIMIT` queries on `Employee.salary_usd` ordered ascending. Because of index `ix_employees_active_salary`, this executes in sub-millisecond time even with 10,000+ records.
3. **Pydantic Schemas**: Create clear, typed Pydantic models in `app/schemas.py`:
   - `CurrencyDistributionItem`: `currency: str`, `count: int`, `percentage: float`
   - `AnalyticsSummaryResponse`: `total_payroll_usd: float`, `average_salary_usd: float`, `median_salary_usd: float`, `total_active_employees: int`, `currency_distribution: list[CurrencyDistributionItem]`
   - `DepartmentAnalyticsItem`: `department: str`, `headcount: int`, `total_payroll_usd: float`, `average_salary_usd: float`, `min_salary_usd: float`, `max_salary_usd: float`
   - `CountryAnalyticsItem`: `country: str`, `headcount: int`, `total_payroll_usd: float`, `average_salary_usd: float`, `min_salary_usd: float`, `max_salary_usd: float`
4. **Service & Router Layering**:
   - `app/services/analytics_service.py`: Contains all SQL aggregation logic for summary, department, and country endpoints.
   - `app/routers/analytics.py`: Exposes `/api/analytics/summary`, `/api/analytics/by-department`, and `/api/analytics/by-country`.

---

## Files Likely to Change
- `[MODIFY] app/schemas.py` — Add analytics response models.
- `[NEW] app/services/analytics_service.py` — Implement `AnalyticsService` with summary, department, and country aggregation methods.
- `[NEW] app/routers/analytics.py` — Define FastAPI route handlers for `/api/analytics/*`.
- `[MODIFY] app/main.py` — Register analytics router.
- `[MODIFY] context/progress-tracker.md` — Update status upon completion.

---

## Implementation Requirements

### 1. `app/schemas.py`
Define:
- `CurrencyDistributionItem(currency: str, count: int, percentage: float)`
- `AnalyticsSummaryResponse(total_payroll_usd: float, average_salary_usd: float, median_salary_usd: float, total_active_employees: int, currency_distribution: list[CurrencyDistributionItem])`
- `DepartmentAnalyticsItem(department: str, headcount: int, total_payroll_usd: float, average_salary_usd: float, min_salary_usd: float, max_salary_usd: float)`
- `CountryAnalyticsItem(country: str, headcount: int, total_payroll_usd: float, average_salary_usd: float, min_salary_usd: float, max_salary_usd: float)`

### 2. `app/services/analytics_service.py`
Implement `AnalyticsService`:
- `get_summary(db: Session) -> AnalyticsSummaryResponse`:
  - Execute `COUNT(id)`, `SUM(salary_usd)`, `AVG(salary_usd)` on active employees (`is_deleted == False`).
  - Calculate exact median from sorted `salary_usd` via index lookup.
  - Execute `COUNT(id)` grouped by `currency` to generate percentage distribution.
- `get_by_department(db: Session) -> list[DepartmentAnalyticsItem]`:
  - Group by `department`, compute headcount, sum, avg, min, max `salary_usd`, ordered by total payroll descending.
- `get_by_country(db: Session) -> list[CountryAnalyticsItem]`:
  - Group by `country`, compute headcount, sum, avg, min, max `salary_usd`, ordered by total payroll descending.

### 3. `app/routers/analytics.py`
Expose:
- `GET /api/analytics/summary` -> `AnalyticsSummaryResponse`
- `GET /api/analytics/by-department` -> `list[DepartmentAnalyticsItem]`
- `GET /api/analytics/by-country` -> `list[CountryAnalyticsItem]`

### 4. `app/main.py`
Include `analytics.router` in the FastAPI application.

---

## Security & Concurrency Requirements
- Concurrency maintained by SQLite WAL mode and read-only aggregation transactions.
- Universal soft-delete isolation prevents deleted records from skewing metrics.
- Return types strictly declared to utilize Pydantic Rust-level response serialization.

---

## Acceptance Criteria
- [ ] `GET /api/analytics/summary` returns accurate total payroll, average, median, active count, and currency breakdown in `<50ms`.
- [ ] `GET /api/analytics/by-department` returns accurate departmental aggregations grouped and sorted by payroll in `<50ms`.
- [ ] `GET /api/analytics/by-country` returns accurate country aggregations grouped and sorted by payroll in `<50ms`.
- [ ] All queries properly ignore soft-deleted employees (`is_deleted == True`).
- [ ] Code strictly follows FastAPI & Pydantic standards (no ellipsis, typed dependencies, explicit schemas).

---

## Checks to Run
1. Run local test queries against `salary_management.db` via Python test scripts.
2. Benchmark query response times over the 10,000 records dataset.
3. Validate API contract and response schema structure.

---

## Atomic Git Commit Breakdown (Phase 4)
1. **Commit 1**: `feat(analytics-service): implement sql aggregations, medians, and geographic breakdowns`
   - Files: `app/schemas.py`, `app/services/analytics_service.py`
2. **Commit 2**: `feat(analytics-api): expose kpi summary, department, and country analytics endpoints`
   - Files: `app/routers/analytics.py`, `app/main.py`, `context/progress-tracker.md`
