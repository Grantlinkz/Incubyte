# Progress Tracker: ACME Global Salary Management

## Current Status
- **Current Phase**: Phase 1: Setup & Data Layer (Ready to start)
- **Current Goal**: Set up FastAPI structure, SQLite WAL database configuration, and `Employee` SQLAlchemy model with composite indexing.

---

## Phase Roadmap & Atomic Commit Milestones (Min. 2 Commits Per Phase)

### Phase 1: Setup & Data Layer
- [ ] Commit 1: `chore(setup): initialize fastapi app structure, pydantic settings config, and sqlite wal connection`
- [ ] Commit 2: `feat(db): implement employee model with soft-delete and composite indexing`

### Phase 2: Batch Seeding Script
- [ ] Commit 1: `feat(constants): define static fx conversion rates lookup matrix`
- [ ] Commit 2: `feat(seed): implement high-performance 10k employee bulk seeder with faker`

### Phase 3: Core Service, CRUD & CSV Export APIs
- [ ] Commit 1: `feat(schemas): define pydantic request response models with positive bounds and currency validation`
- [ ] Commit 2: `feat(service): implement employee service for crud, soft-delete, advanced filtering, and sorting`
- [ ] Commit 3: `feat(api): expose employee crud, paginated list, and streaming csv export endpoints`

### Phase 4: Analytics & Aggregations
- [ ] Commit 1: `feat(analytics-service): implement sql aggregations, medians, and geographic breakdowns`
- [ ] Commit 2: `feat(analytics-api): expose kpi summary, department, and country analytics endpoints`

### Phase 5: Testing & CI Readiness
- [ ] Commit 1: `tests(unit): add unit tests for fx conversion, median calculations, and pydantic validation`
- [ ] Commit 2: `tests(integration): add testclient integration tests for crud, filters, exports, and analytics`

### Phase 6: Performance & Documentation
- [ ] Commit 1: `chore(perf): configure cors middleware, openapi tags, and benchmark <200ms latency verification`
- [ ] Commit 2: `docs(backend): add comprehensive readme with architecture, seed guide, and api specs`

---

## Architecture & Technical Decisions

1. **SQLite WAL Mode**: Enabled via SQLAlchemy connect listener (`PRAGMA journal_mode=WAL;`) to guarantee readers do not block writers.
2. **Static FX Rates**: Stored in `app/constants/fx_rates.py` for deterministic base currency USD normalization without third-party API dependencies.
3. **Universal Soft Deletion**: Models include `is_deleted` column; all service-layer queries filter `is_deleted == False`.
4. **FastAPI & Pydantic Conventions**: Utilizing installed `.agents/skills/fastapi` rules (`Annotated` typing, explicit return types, no `RootModel`, router-level tags/prefix).
5. **Multiple Atomic Commits**: Enforced >= 2 distinct atomic commits per phase to showcase clean, incremental development history.

---

## Session Notes
- Python virtual environment `.venv` initialized with all dependencies installed.
- FastAPI & Pydantic agent skills extracted to `.agents/skills/fastapi`.
- Context files and GEMINI.md fully updated to reflect multi-commit per phase workflow and 10-step prompt methodology.
