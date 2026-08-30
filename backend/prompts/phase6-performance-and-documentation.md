# Phase 6 Implementation Prompt: Performance & Documentation

## Goal
Finalize the backend for production and UI integration by refining CORS middleware configurations, enriching OpenAPI metadata documentation, executing and verifying query latency benchmarks on the 10,000 seeded dataset to guarantee <200ms response times, and writing a comprehensive architectural `README.md`.

---

## Skills Read
- `.agents/skills/fastapi/SKILL.md` — FastAPI conventions, OpenAPI tags metadata structure, middleware configurations, and clean API design.

---

## Existing Code Inspected
- `app/main.py` — FastAPI application entrypoint, CORS middleware, lifespan, router inclusion, and health check.
- `app/config.py` — Application settings, environment configuration, and default CORS origins.
- `app/routers/employees.py` & `app/routers/analytics.py` — Endpoint definitions and schemas.
- `scripts/seed.py` — 10,000 employee record seeder.
- `salary_management.db` — Seeded SQLite database in WAL mode with composite indexes.
- `tests/` — Pytest test suite (33 passing unit and integration tests).
- `assesesment details/Backend Implementation Plan.pdf`, `Product Requirements Document.pdf`, and `Salary Management Assessment.pdf`.
- `context/architecture.md`, `context/code-standards.md`, `context/ui-context.md`, and `context/progress-tracker.md`.

---

## Decisions & Assumptions
1. **CORS Configuration & UI Readiness**:
   - Update `app/config.py` default CORS origins to support common frontend development ports: `http://localhost:3000`, `http://127.0.0.1:3000` (Next.js default), `http://localhost:5173`, `http://127.0.0.1:5173` (Vite default), and `http://localhost:8080`.
   - Maintain `expose_headers=["Content-Disposition"]` for streaming CSV download filename detection on the client.
2. **OpenAPI Tags & Metadata**:
   - Provide detailed OpenAPI metadata on `FastAPI(..., openapi_tags=[...])` with descriptive summaries for `Employees`, `Analytics`, and `Health` tags to generate rich interactive documentation at `/docs` and `/redoc`.
3. **Automated Latency Benchmarking (`scripts/benchmark.py`)**:
   - Create a benchmarking script that connects to `salary_management.db` (seeded with 10,000 records) or runs through the FastAPI TestClient/requests to measure execution latencies across 50 iterations per operation:
     - 1. Paginated list (`skip=0&limit=50`)
     - 2. Filtered query (`department=Engineering&country=United States&status=Active`)
     - 3. Text search query (`search=Alex`)
     - 4. Multi-column sorted query (`sort_by=salary_usd&sort_order=desc`)
     - 5. Single record lookup (`/api/employees/1`)
     - 6. Full dataset CSV export stream
     - 7. KPI Summary aggregations (`/api/analytics/summary`)
     - 8. Departmental breakdown (`/api/analytics/by-department`)
     - 9. Country/Geographic breakdown (`/api/analytics/by-country`)
   - Compute min, mean, p50, p95, and p99 latencies, asserting and outputting validation that all p95 and mean latencies operate well below the <200ms non-functional requirement.
4. **Comprehensive Architectural README**:
   - Author a clean, comprehensive `README.md` containing:
     - Executive summary, problem framing, and target HR persona.
     - Architecture diagrams (Mermaid) and key design decisions (SQLite WAL, layered separation, static FX matrix, soft-deleting, indexing, streaming).
     - Directory structure breakdown.
     - Setup, environment, and virtualenv installation guide.
     - Database seeding instructions (<2s generation of 10,000 records).
     - Server startup instructions and Swagger UI documentation overview.
     - Complete API Endpoint Catalog with parameters and response models.
     - Latency benchmark results table proving <200ms SLA.
     - Test execution guide (`pytest`).
     - AI-driven development log and atomic git commit methodology.

---

## Files Likely to Change
- `[MODIFY] app/config.py` — Add default CORS origins for modern frontend development tools.
- `[MODIFY] app/main.py` — Add OpenAPI tags metadata and enriched app documentation.
- `[NEW] scripts/benchmark.py` — Sub-200ms latency benchmark verification script.
- `[NEW] README.md` — Complete, production-grade project documentation.
- `[MODIFY] context/progress-tracker.md` — Mark Phase 6 complete.

---

## Commit Milestones (Minimum 2 Atomic Commits)
- **Commit 1**: `chore(perf): configure cors middleware, openapi tags, and benchmark <200ms latency verification`
- **Commit 2**: `docs(backend): add comprehensive readme with architecture, seed guide, and api specs`

---

## Verification Plan
1. Run `python -m scripts.benchmark` to execute all latency benchmarks and verify <200ms execution times on the 10,000-record dataset.
2. Run `pytest` to guarantee all 33 unit and integration tests continue to pass without regressions.
3. Verify `README.md` formatting, links, and code blocks.
