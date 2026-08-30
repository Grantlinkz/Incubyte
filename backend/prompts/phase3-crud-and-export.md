# Implementation Prompt: Phase 3 - Core Service, CRUD & CSV Export APIs

## 1. Goal
Implement the Pydantic v2 schemas, business logic service layer (`EmployeeService`), and FastAPI REST endpoints (`/api/employees`) for ACME Global Salary Management. This includes paginated filtering/searching across 10,000+ records, soft-delete operations, automatic USD normalization upon creation/update, and a memory-efficient chunked streaming CSV export.

---

## 2. Skills Read
- `.agents/skills/fastapi/SKILL.md`:
  - `Annotated` syntax for dependency injection (`SessionDep = Annotated[Session, Depends(get_db)]`) and parameters (`Query`, `Path`).
  - Explicit return types on path operations (`-> PaginatedResponse[EmployeeResponse]`, `-> EmployeeResponse`).
  - No ellipsis (`...`) in Pydantic fields or parameter defaults.
  - No `RootModel` usage.
  - Router-level `prefix="/api/employees"` and `tags=["employees"]` declared on `APIRouter`.
  - `StreamingResponse` for memory-efficient CSV streaming.

---

## 3. Existing Code Inspected
- `app/database.py`: Session dependency `SessionDep`, engine with SQLite WAL pragmas (`PRAGMA journal_mode=WAL;`).
- `app/models.py`: `Employee` SQLAlchemy 2.0 ORM model with `is_deleted`, composite indexes (`ix_employees_active_dept_country`, `ix_employees_active_salary`), and field definitions.
- `app/constants/fx_rates.py`: `FX_RATES`, `SUPPORTED_CURRENCIES`, `convert_to_usd()`, and `calculate_salary_usd()`.
- `app/main.py`: FastAPI app initialization and CORS middleware setup.
- `context/project-overview.md` & `context/architecture.md`: Specification for employee fields, filtering parameters, sorting, pagination, and soft-delete invariants.

---

## 4. Decisions & Assumptions
1. **Pydantic v2 Schemas (`app/schemas.py`)**:
   - `EmployeeBase`: Common fields (`name`, `email`, `job_title`, `department`, `country`, `employment_type`, `base_salary`, `bonus`, `currency`, `status`).
   - `EmployeeCreate`: Strict field validation with `EmailStr`, `base_salary > 0`, `bonus >= 0`, `currency` validated against `SUPPORTED_CURRENCIES`, `status` validated or defaulted to `"Active"`.
   - `EmployeeUpdate`: Optional fields for partial updates (`name`, `job_title`, `department`, `country`, `employment_type`, `base_salary`, `bonus`, `currency`, `status`).
   - `EmployeeResponse`: Complete representation including `id`, `salary_usd`, `is_deleted`, `created_at`, `updated_at`. `model_config = ConfigDict(from_attributes=True)`.
   - `PaginatedResponse[T]`: Generic pagination container with `items: list[T]`, `total: int`, `page: int`, `page_size: int`, `total_pages: int`.
2. **Service Layer (`app/services/employee_service.py`)**:
   - `EmployeeService` class / module functions encapsulating:
     - `list_employees()`: Dynamic SQL filtering (keyword search on `name`, `email`, `job_title`; exact matches on `department`, `country`, `job_title`, `employment_type`, `status`), sorting (on `id`, `name`, `base_salary`, `bonus`, `salary_usd`, `created_at`), pagination (`offset`, `limit`), and `is_deleted == False` invariant.
     - `get_employee()`: ID lookup enforcing `is_deleted == False`.
     - `create_employee()`: Unique email check, `salary_usd` calculation via `calculate_salary_usd()`, database persist.
     - `update_employee()`: Target lookup, unique email collision check, `salary_usd` recalculation if `base_salary`, `bonus`, or `currency` modified.
     - `delete_employee()`: Soft-delete (`is_deleted = True`, `updated_at = datetime.utcnow()`).
     - `generate_csv_stream()`: Generator function querying records in chunks (e.g. 1,000 records) and yielding CSV row strings to prevent loading all records into memory.
3. **API Router (`app/routers/employees.py`)**:
   - `GET /api/employees`: Paginated employee search & filter grid.
   - `POST /api/employees`: Create new employee (status `201 Created`).
   - `GET /api/employees/export`: Streaming CSV export with `StreamingResponse(content=..., media_type="text/csv")` and `Content-Disposition` header.
   - `GET /api/employees/{employee_id}`: Single employee detail.
   - `PUT /api/employees/{employee_id}`: Update employee details.
   - `DELETE /api/employees/{employee_id}`: Soft-delete employee (`204 No Content`).
4. **App Registration (`app/main.py`)**:
   - Register `employees.router` with the main FastAPI instance.

---

## 5. Files to Create / Modify
- `app/schemas.py` (New file)
- `app/services/__init__.py` (New file)
- `app/services/employee_service.py` (New file)
- `app/routers/__init__.py` (New file)
- `app/routers/employees.py` (New file)
- `app/main.py` (Modify to register employee router)

---

## 6. Implementation Requirements & Invariants
- **Universal Soft-Delete**: Every read and export query must include `Employee.is_deleted == False`.
- **Deterministic FX**: All salary calculations compute `salary_usd = round((base_salary + (bonus or 0)) * FX_RATES[currency], 2)`.
- **FastAPI Standards**: Use `Annotated` for all query/path params and dependencies; use explicit return types.
- **Memory Safety**: CSV export must yield chunks, never holding the complete 10k dataset in memory.
- **Error Handling**: Raise `HTTPException(404, "Employee not found")` when employee does not exist or is soft-deleted; raise `HTTPException(400, "Email already registered")` on duplicate email.

---

## 7. Acceptance Criteria
1. `GET /api/employees` returns paginated records with total count, correct page numbers, and fast response times (< 200ms).
2. Multi-attribute filtering (`department`, `country`, `job_title`, `employment_type`, `status`) and search (`name`, `email`) work accurately.
3. `POST /api/employees` validates input, computes `salary_usd`, and persists the record.
4. `PUT /api/employees/{id}` updates attributes and recalculates `salary_usd` when compensation changes.
5. `DELETE /api/employees/{id}` sets `is_deleted = True`.
6. `GET /api/employees/export` streams a valid CSV file containing all filtered active employee records.

---

## 8. Checks to Run
1. `pytest` or ad-hoc test script validating:
   - Schema validation bounds (`base_salary > 0`, invalid currency code raises error).
   - CRUD lifecycle (create -> fetch -> update -> verify FX recalculation -> soft-delete -> verify 404).
   - Filter query and pagination verification.
   - Streaming CSV export format and row counts.
2. Endpoint latency check ensuring `< 200ms` response over the 10k dataset.

---

## 9. Atomic Git Commit Breakdown (Min. 2 Commits)
- **Commit 1**: `feat(schemas): define pydantic request response models with positive bounds and currency validation`
- **Commit 2**: `feat(service): implement employee service for crud, soft-delete, advanced filtering, and sorting`
- **Commit 3**: `feat(api): expose employee crud, paginated list, and streaming csv export endpoints`
