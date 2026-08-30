# Code Standards: ACME Global Salary Management

## General Principles

- **Single Responsibility**: Each module, class, and service function must own exactly one responsibility.
- **Layer Separation**: Keep API route handlers thin. All database interactions and calculations must live in `app/services/`.
- **Type Safety**: Use explicit Python type annotations throughout the codebase. No untyped parameters or ambiguous `Any` returns.

---

## FastAPI & Pydantic Standards (from `.agents/skills/fastapi`)

- **Dependency Injection**: Use `Annotated[..., Depends(...)]` for database sessions and shared dependencies.
- **Query & Path Parameters**: Use `Annotated[Type, Query(...)]` and `Annotated[Type, Path(...)]`.
- **Response Models & Typing**: Prefer explicit return types on path operations (`async def list_employees(...) -> PaginatedResponse[EmployeeRead]:`) for automatic Pydantic v2 validation and fast Rust serialization.
- **No Ellipsis (`...`) or RootModel**:
  - Do not use `...` as a default value in Pydantic fields or parameter declarations.
  - Do not use `RootModel`; use standard collections with `Annotated` (e.g., `list[EmployeeRead]`).
- **One HTTP Operation Per Function**: Do not mix multiple HTTP verbs in a single route handler.
- **Router Configuration**: Declare router prefix, tags, and shared dependencies on `APIRouter(...)` rather than inside `include_router`.

---

## SQLAlchemy 2.0 & Database Standards

- **Modern SQLAlchemy 2.0 Syntax**:
  - Use `select(Employee).where(...)`, `insert(Employee).values(...)`, and `update(Employee).where(...)`. Avoid legacy query API (`session.query()`).
  - Use `Mapped[...]` and `mapped_column(...)` for ORM model declarations.
- **Universal Soft-Delete Filtering**:
  - Every query retrieving employee records must filter on `Employee.is_deleted == False`.
- **Bulk Insertions**:
  - Use `session.execute(insert(Employee), chunk_of_dicts)` in batches (e.g., 2,000 records per chunk) during seeding to maximize SQLite throughput.
- **Concurrency & WAL Mode**:
  - Ensure `PRAGMA journal_mode=WAL;` is attached to SQLite engine connections.

---

## Pydantic Schema Validation Rules

- **Positive Bounds**: `base_salary > 0`, `bonus >= 0`.
- **Currency Validation**: Must validate currency code against supported keys in `FX_RATES` (e.g., `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`, `SGD`, `JPY`).
- **Required Fields**: `name`, `email`, `job_title`, `department`, `country`, `base_salary`, `currency`.

---

## Testing & Quality Assurance

- **Isolation**: Tests must run against an in-memory SQLite database (`sqlite:///:memory:`) configured in `tests/conftest.py`.
- **Fixtures**: Use clean DB setup/teardown fixtures yielding a fresh `TestClient` per test module/function.
- **Coverage**:
  - Unit tests for FX conversion formulas, median salary calculations, and schema validations.
  - Integration tests for CRUD endpoints, pagination edge cases, multi-attribute filtering, soft-delete behavior, streaming CSV export, and analytics aggregations.

---

## Git Commit Standards: Multiple Atomic Commits per Phase

- Every phase must produce **at least two distinct, atomic commits** representing logical progression.
- All commit messages must strictly use conventional prefixes:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for refactoring code without changing behavior
  - `docs:` for documentation updates
  - `tests:` for test additions and modifications
  - `chore:` for environment and setup maintenance
