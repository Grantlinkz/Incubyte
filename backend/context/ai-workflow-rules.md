# AI Workflow Rules: ACME Global Salary Management

## 1. Mandatory 10-Step Workflow

For every implementation request:

1. **Read `AGENTS.md`**.
2. **Read the skills** explicitly mentioned by the user (e.g. `.agents/skills/fastapi`).
3. **Read clearly needed supporting context files** (`project-overview.md`, `architecture.md`, `code-standards.md`, `progress-tracker.md`, `ui-context.md`).
4. **Inspect relevant code**.
5. **Ask a focused question** only if the task has meaningful ambiguity.
6. **Create a detailed prompt file in `prompts/`** (e.g., `prompts/phase1-setup-and-data-layer.md`).
7. **Ask**: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
8. **On approval**, re-read the approved prompt file in `prompts/` and implement it strictly. Implement only after user approval.
9. **Run available checks** (`pytest`, linting).
10. **Share exact steps to test or run the completed feature** and execute the **multiple atomic commits** for the phase.

> **Crucial Rule**: Do not code before creating the prompt unless the user explicitly says to skip prompt creation.

---

## 2. Mandatory Git Commit Rule: Multiple Atomic Commits per Phase

Every phase completion must include **at least two distinct, granular, atomic commits** representing logical architectural progress.

### Commit Prefix Conventions:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `tests:` for tests addition and modification
- `chore:` for maintenance tasks and environment setup

### Standard Phase Commit Cadence:

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

## 3. Verification & Documentation Gates

Before marking any phase as complete:
1. Run test suite: `pytest`
2. Verify query latency and data consistency (<200ms).
3. Execute the atomic commits according to the phase cadence.
4. Update [`context/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/progress-tracker.md).
