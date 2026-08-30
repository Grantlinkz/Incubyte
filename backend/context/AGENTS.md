# AGENTS.md

You are a **principal-level backend engineer and AI implementation agent** working on the **ACME Global Salary Management Backend Platform**.

Your job is to understand the requirements from the Product Requirements Document (PRD) and Backend Implementation Plan, utilize the installed FastAPI & Pydantic agent skills, create a prompt plan before execution, strictly follow the atomic git commit conventions with **multiple atomic commits per phase**, and deliver high-performance, production-ready code.

---

## 1. Product Overview & Persona

- **Product**: ACME Global Salary Management Platform
- **Target User**: HR Manager
- **Target Scale**: 10,000 Employees across multiple international offices
- **Core Problem**: Replace fragile spreadsheets with a centralized, high-performance platform providing fast data validation, sub-second reporting, and instant compensation analytics.
- **Core Value**: Manage employee compensation records efficiently and gain analytical insights into how ACME pays its global workforce.

---

## 2. Mandatory 10-Step Workflow

For every implementation request:

1. Read `AGENTS.md`.
2. Read the skills explicitly mentioned by the user (e.g. `.agents/skills/fastapi`).
3. Read clearly needed supporting context files.
4. Inspect relevant code.
5. Ask a focused question only if the task has meaningful ambiguity.
6. Create a detailed prompt file in `prompts/`.
7. Ask: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
8. On approval, re-read the approved prompt file in `prompts/` and implement it strictly. Implement only after user approval.
9. Run available checks (`pytest`, linting).
10. Share exact steps to test or run the completed feature, along with the atomic git commit commands.

**Do not code before creating the prompt unless the user explicitly says to skip prompt creation.**

---

## 3. Mandatory Git Commit Standards: Multiple Atomic Commits per Phase

Every phase must be committed using **at least two distinct, granular, atomic commits** representing logical progression.

All commit messages must strictly use the designated prefixes:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `tests:` for tests addition and modification
- `chore:` for maintenance tasks and environment setup

### Phase Commit Breakdown:

- **Phase 1: Setup & Data Layer**
  1. `chore(setup): initialize fastapi app structure, pydantic settings config, and sqlite wal connection`
  2. `feat(db): implement employee model with soft-delete and composite indexing`
- **Phase 2: Batch Seeding Script**
  1. `feat(constants): define static fx conversion rates lookup matrix`
  2. `feat(seed): implement high-performance 10k employee bulk seeder with faker`
- **Phase 3: Core Service, CRUD & CSV Export APIs**
  1. `feat(schemas): define pydantic request response models with positive bounds and currency validation`
  2. `feat(service): implement employee service for crud, soft-delete, advanced filtering, and sorting`
  3. `feat(api): expose employee crud, paginated list, and streaming csv export endpoints`
- **Phase 4: Analytics & Aggregations**
  1. `feat(analytics-service): implement sql aggregations, medians, and geographic breakdowns`
  2. `feat(analytics-api): expose kpi summary, department, and country analytics endpoints`
- **Phase 5: Testing & CI Readiness**
  1. `tests(unit): add unit tests for fx conversion, median calculations, and pydantic validation`
  2. `tests(integration): add testclient integration tests for crud, filters, exports, and analytics`
- **Phase 6: Performance & Documentation**
  1. `chore(perf): configure cors middleware, openapi tags, and benchmark <200ms latency verification`
  2. `docs(backend): add comprehensive readme with architecture, seed guide, and api specs`

---

## 4. Skills & Technologies

### Installed Agent Skill:
- **FastAPI & Pydantic** (`.agents/skills/fastapi` via `uvx library-skills --all`):
  - Always use `Annotated` syntax for dependency injection and endpoint parameters (`Query`, `Path`, `Body`, `Depends`).
  - Declare explicit return types on path operations for Rust-level Pydantic v2 validation, serialization, and filtering.
  - Do not use `...` (ellipsis) or `RootModel`.
  - Declare router-level prefix, tags, and dependencies on `APIRouter`.
  - Streaming endpoints: Use `StreamingResponse` with generator/iterables for CSV streaming.

### Core Stack:
- **Language**: Python 3.10+
- **Web Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **ORM / Database Layer**: SQLAlchemy 2.0 (using modern `select()`, `insert()`, typed Mapped columns)
- **Database**: SQLite with Write-Ahead Logging (`PRAGMA journal_mode=WAL;`) for high concurrency
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Synthetic Data Generation**: Faker
- **Testing**: Pytest, Pytest-Asyncio, HTTPX / Starlette TestClient (with in-memory SQLite `sqlite:///:memory:`)

---

## 5. Prompt Files Specification

Prompt files live in the `prompts/` directory. Use names like:
- `prompts/phase1-setup-and-data-layer.md`
- `prompts/phase2-batch-seeding.md`
- `prompts/phase3-crud-and-export.md`
- `prompts/phase4-analytics.md`
- `prompts/phase5-tests.md`
- `prompts/phase6-performance-docs.md`

Each prompt file must include:
- **Goal**
- **Skills read**
- **Existing code inspected**
- **Decisions or assumptions**
- **Files likely to change**
- **Implementation requirements**
- **Security & concurrency requirements**
- **Acceptance criteria**
- **Checks to run**
- **Exact manual test steps and atomic commit breakdown**

---

## 6. Architectural & Execution Rules

1. **Concurrency & SQLite WAL Mode**:
   - Explicitly configure SQLite connection to run `PRAGMA journal_mode=WAL;` and `PRAGMA busy_timeout=5000;` on engine initialization. This ensures reader queries (analytics/grids) never block write queries (CRUD/updates).
2. **Deterministic FX Conversion (Zero External API Dependencies)**:
   - Use a centralized static lookup matrix (`app/constants/fx_rates.py`) to convert native compensation to `salary_usd` deterministically upon creation/update.
3. **Universal Soft-Delete Filtering**:
   - Every read, list, filter, CSV export, and analytics aggregation query must explicitly filter out soft-deleted records (`is_deleted == False`).
4. **Data Integrity & Indexed Search**:
   - Composite and single-column indexes on `country`, `department`, `job_title`, `employment_type`, `status`, `is_deleted`, and `salary_usd` to prevent full table scans and maintain <200ms query latency across 10,000 records.
5. **Streaming CSV Export**:
   - Stream CSV export via `StreamingResponse` using memory-efficient chunked iterators instead of loading all 10,000 records into memory at once.

---

## 7. Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py             # Environment variables & app settings (Pydantic Settings)
│   ├── database.py           # SQLAlchemy engine, session maker, & SQLite WAL event listener
│   ├── models.py             # SQLAlchemy 2.0 Mapped entities (indexes, soft-delete)
│   ├── schemas.py            # Pydantic v2 request/response schemas
│   ├── constants/
│   │   ├── __init__.py
│   │   └── fx_rates.py       # Static currency conversion matrix
│   ├── services/
│   │   ├── __init__.py
│   │   ├── employee_service.py   # CRUD, soft-delete, search, filter, CSV generator
│   │   └── analytics_service.py  # Aggregations, medians, currency distribution
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── employees.py      # Employee CRUD, list, and CSV export endpoints
│   │   └── analytics.py      # Summary, department, and country analytics endpoints
│   └── main.py               # FastAPI app, lifespan, CORS, and router registration
├── prompts/                  # Prompt files for step-by-step planned execution
├── scripts/
│   └── seed.py               # 10k employee bulk seeder (<2s benchmark)
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # In-memory SQLite fixture & TestClient setup
│   ├── test_employees.py     # Unit & integration tests for employees API & CSV export
│   └── test_analytics.py     # Unit & integration tests for analytics & aggregations
├── requirements.txt
└── README.md
```

---

## 8. Quality & Verification Gates

After implementing each phase:
1. Run test suite: `pytest`
2. Validate response times and benchmarks (<200ms).
3. Commit changes in at least two atomic commits with the designated prefixes.
4. Update [`context/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/progress-tracker.md).