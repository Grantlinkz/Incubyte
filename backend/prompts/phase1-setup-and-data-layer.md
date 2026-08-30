# Implementation Prompt: Phase 1 — Setup & Data Layer

## Goal
Establish the core FastAPI application foundation, configure high-concurrency SQLite with Write-Ahead Logging (WAL) via SQLAlchemy 2.0, and define the `Employee` ORM model with single-column and composite indexes, timestamps, and universal soft-deletion support.

---

## Skills Read
- `.agents/skills/fastapi/SKILL.md` (FastAPI and Pydantic best practices, `Annotated` dependency injection, explicit return types, no ellipsis `...`, no `RootModel`).

---

## Existing Code Inspected
- `requirements.txt`: Confirmed FastAPI, Uvicorn, SQLAlchemy 2.0+, Pydantic v2, and Pydantic-Settings are specified.
- `context/AGENTS.md`, `context/architecture.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`: Validated table schemas, indexing strategy, WAL pragma setup, and multi-commit requirements.

---

## Decisions & Assumptions
1. **SQLAlchemy 2.0 Declarative Syntax**: Utilize `DeclarativeBase`, `Mapped[...]`, and `mapped_column(...)` for modern type safety.
2. **SQLite WAL Concurrency**: Attach an engine-level connect event listener executing `PRAGMA journal_mode=WAL;`, `PRAGMA synchronous=NORMAL;`, and `PRAGMA busy_timeout=5000;` to avoid locking during concurrent read/write workflows.
3. **Database Dependency**: Implement `get_db()` session generator with `yield` and proper cleanup.
4. **FastAPI Lifespan**: Use modern FastAPI `lifespan` context manager in `app/main.py` for database table initialization and startup/shutdown hooks.
5. **Two Atomic Commits**:
   - First commit for app structure, config, and database connection.
   - Second commit for the `Employee` model with soft-delete and composite indexes.

---

## Files Likely to Change / Create
- `app/__init__.py` [NEW]
- `app/config.py` [NEW]
- `app/database.py` [NEW]
- `app/models.py` [NEW]
- `app/main.py` [NEW]
- `context/progress-tracker.md` [MODIFY]

---

## Implementation Requirements

### 1. Configuration (`app/config.py`)
- Define `Settings` inheriting from `pydantic_settings.BaseSettings`.
- Configuration fields:
  - `app_name: str = "ACME Global Salary Management"`
  - `debug: bool = False`
  - `database_url: str = "sqlite:///./salary_management.db"`
  - `cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]`
- Use `SettingsConfigDict(env_file=".env", extra="ignore")`.
- Export instantiated `settings = Settings()`.

### 2. Database Layer (`app/database.py`)
- Create SQLAlchemy engine with `connect_args={"check_same_thread": False}` for SQLite.
- Attach `@event.listens_for(engine, "connect")` listener executing:
  - `PRAGMA journal_mode=WAL;`
  - `PRAGMA synchronous=NORMAL;`
  - `PRAGMA busy_timeout=5000;`
- Configure `sessionmaker(autocommit=False, autoflush=False, bind=engine)`.
- Define base class `class Base(DeclarativeBase): pass`.
- Provide dependency generator `def get_db() -> Generator[Session, None, None]`.

### 3. Employee Model (`app/models.py`)
- Define `Employee(Base)` table `employees`:
  - `id`: `Mapped[int]` primary key, autoincrement
  - `name`: `Mapped[str]` (VARCHAR 255, nullable=False)
  - `email`: `Mapped[str]` (VARCHAR 255, unique=True, nullable=False, index=True)
  - `job_title`: `Mapped[str]` (VARCHAR 255, nullable=False, index=True)
  - `department`: `Mapped[str]` (VARCHAR 100, nullable=False, index=True)
  - `country`: `Mapped[str]` (VARCHAR 100, nullable=False, index=True)
  - `employment_type`: `Mapped[str]` (VARCHAR 50, nullable=False, index=True)
  - `base_salary`: `Mapped[float]` (Float, nullable=False)
  - `bonus`: `Mapped[float]` (Float, nullable=False, default=0.0)
  - `currency`: `Mapped[str]` (VARCHAR 10, nullable=False)
  - `salary_usd`: `Mapped[float]` (Float, nullable=False, index=True)
  - `status`: `Mapped[str]` (VARCHAR 50, nullable=False, default="Active", index=True)
  - `is_deleted`: `Mapped[bool]` (Boolean, default=False, nullable=False, index=True)
  - `created_at`: `Mapped[datetime]` (DateTime, default=datetime.utcnow, nullable=False)
  - `updated_at`: `Mapped[datetime]` (DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
- Composite indexes:
  - `Index("ix_employees_active_dept_country", "is_deleted", "department", "country")`
  - `Index("ix_employees_active_salary", "is_deleted", "salary_usd")`

### 4. FastAPI Entrypoint (`app/main.py`)
- Create `lifespan` function ensuring `Base.metadata.create_all(bind=engine)`.
- Initialize `FastAPI` instance with title, metadata, lifespan, and CORS middleware.
- Add health check endpoint `GET /health` returning `{"status": "ok", "app": settings.app_name}`.

---

## Security & Concurrency Requirements
- SQLite connection configured with 5000ms busy timeout and WAL mode to prevent locking under concurrent read/write loads.
- Disallow raw SQL string formatting; rely on SQLAlchemy 2.0 type-safe expressions.

---

## Acceptance Criteria
1. `app/database.py` successfully connects and verifies WAL pragma execution.
2. `app/models.py` defines all required employee fields, single-column indexes, and composite indexes.
3. `app/main.py` launches cleanly and responds to `GET /health` with HTTP 200.
4. Database tables and indexes are generated cleanly in SQLite.

---

## Checks to Run
- Run Python verification script to test DB connection, pragma settings, and table creation.
- Run health check test via FastAPI TestClient.

---

## Manual Test Steps & Atomic Commit Breakdown

### Verification Steps:
1. Initialize virtual environment and test table generation with `python -c "from app.database import engine, Base; from app.models import Employee; Base.metadata.create_all(bind=engine)"`.
2. Inspect table schema and indexes on generated SQLite database.
3. Test `/health` endpoint using TestClient.

### Atomic Commit Plan:
1. `chore(setup): initialize fastapi app structure, pydantic settings config, and sqlite wal connection`
2. `feat(db): implement employee model with soft-delete and composite indexing`
