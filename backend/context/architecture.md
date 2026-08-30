# Architecture Context: ACME Global Salary Management

## Technology Stack

| Layer | Technology | Role / Rationale |
|---|---|---|
| **Language** | Python 3.10+ | Core language with strong static typing and fast runtime |
| **Framework** | FastAPI (latest) | Modern ASGI framework with automatic OpenAPI docs and dependency injection |
| **Validation** | Pydantic v2 & Pydantic-Settings | Fast Rust-backed schema validation and environment management |
| **ORM / Querying** | SQLAlchemy 2.0 | Type-safe declarative Mapped models and modern `select()` syntax |
| **Database** | SQLite 3 with WAL Mode | File-backed relational storage with `PRAGMA journal_mode=WAL;` for concurrency |
| **Synthetic Seeding** | Faker | Realistic names, job titles, departments, and compensation generation |
| **Testing** | Pytest, HTTPX / TestClient | Unit and integration tests against in-memory SQLite (`sqlite:///:memory:`) |

---

## System Boundaries & Layer Responsibilities

- **`app/main.py`**: FastAPI entrypoint, lifespan event hooks (database setup), CORS middleware configuration, and global exception handlers.
- **`app/config.py`**: Application settings derived from environment variables using `pydantic-settings.BaseSettings`.
- **`app/database.py`**: SQLAlchemy engine configuration, connection pool settings, session dependency (`get_db`), and SQLite WAL pragma event listeners.
- **`app/models.py`**: SQLAlchemy ORM entities with indexed fields, constraints, and timestamps.
- **`app/schemas.py`**: Pydantic request and response models with strict field validation.
- **`app/constants/fx_rates.py`**: Static currency conversion matrix for USD normalization.
- **`app/services/`**:
  - `employee_service.py`: Encapsulates CRUD operations, dynamic filtering, sorting, pagination, soft-deletion, and streaming CSV generation.
  - `analytics_service.py`: Encapsulates SQL aggregation queries, median computations, departmental breakdowns, and country salary distributions.
- **`app/routers/`**: Thin API route handlers using `Annotated` dependency injection.
- **`scripts/seed.py`**: Standalone high-performance bulk database seeder inserting 10,000 records in <2s.

---

## Data Model & Indexing Strategy

### `Employee` Entity Fields
- `id`: Integer primary key (autoincrement)
- `name`: String (non-nullable)
- `email`: String (non-nullable, unique)
- `job_title`: String (non-nullable)
- `department`: String (non-nullable)
- `country`: String (non-nullable)
- `employment_type`: String (e.g., 'Full-time', 'Part-time', 'Contractor')
- `base_salary`: Float / Numeric (non-nullable, >= 0)
- `bonus`: Float / Numeric (nullable / default 0.0, >= 0)
- `currency`: String (ISO 3-letter currency code, e.g., 'USD', 'EUR', 'GBP', 'INR', 'CAD')
- `salary_usd`: Float / Numeric (derived standardized total annual compensation in USD)
- `status`: String (e.g., 'Active', 'On Leave', 'Terminated')
- `is_deleted`: Boolean (default `False`, soft-delete flag)
- `created_at`: DateTime (default UTC now)
- `updated_at`: DateTime (default UTC now, on-update UTC now)

### Indexing Scheme
To guarantee `<200ms` query latency over 10,000 records:
1. **Single-Column Indexes**:
   - `ix_employees_country` on `country`
   - `ix_employees_department` on `department`
   - `ix_employees_job_title` on `job_title`
   - `ix_employees_employment_type` on `employment_type`
   - `ix_employees_status` on `status`
   - `ix_employees_is_deleted` on `is_deleted`
   - `ix_employees_salary_usd` on `salary_usd`
2. **Composite Indexes**:
   - `ix_employees_active_dept_country` on `(is_deleted, department, country)`
   - `ix_employees_active_salary` on `(is_deleted, salary_usd)`

---

## Concurrency & Storage Architecture

### SQLite WAL Mode Configuration
SQLite by default can lock during simultaneous reads and writes. To achieve high concurrency:
- Configure engine with `connect` event listener:
  ```python
  @event.listens_for(engine, "connect")
  def set_sqlite_pragma(dbapi_connection, connection_record):
      cursor = dbapi_connection.cursor()
      cursor.execute("PRAGMA journal_mode=WAL;")
      cursor.execute("PRAGMA synchronous=NORMAL;")
      cursor.execute("PRAGMA busy_timeout=5000;")
      cursor.close()
  ```
- WAL (Write-Ahead Logging) allows concurrent readers while a write is occurring without table lockouts.

---

## FX Conversion Architecture

- Zero external network dependencies.
- Static conversion table in `app/constants/fx_rates.py`:
  - `USD`: 1.0
  - `EUR`: 1.08
  - `GBP`: 1.28
  - `INR`: 0.012
  - `CAD`: 0.74
  - `AUD`: 0.66
  - `SGD`: 0.75
  - `JPY`: 0.0067
  - `NGN`: 0.00067
- Normalization formula: `salary_usd = (base_salary + (bonus or 0)) * FX_RATES[currency]`
- `salary_usd` is stored directly on the row, indexed, and used for all analytics and sorting.

---

## Core System Invariants

1. **Universal Soft-Delete Exclusion**: Every SELECT query in the repository/service layer must include `is_deleted == False`.
2. **Deterministic FX Calculation**: `salary_usd` must always be calculated on the backend before write/update.
3. **Thin API Routers**: Routers only handle HTTP parsing, dependency injection, and status codes. All SQL querying and aggregation logic lives in `app/services/`.
4. **Memory-Safe Streaming**: CSV export must never load the entire 10,000-record dataset into memory as a list; use streaming iterators.
5. **Atomic Commits**: Every phase must follow the strict git commit message format (`feat:`, `fix:`, `refactor:`, `docs:`, `tests:`, `chore:`).
