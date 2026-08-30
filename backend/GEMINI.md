# Project Rules and Agent Instructions: ACME Global Salary Management

This project follows the rules, workflows, and specifications defined in [`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/AGENTS.md).

---

## 1. Master Agent Instructions

All agent workflows, architectural decisions, coding patterns, and verification steps are governed by:
👉 **[`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/AGENTS.md)**

Before implementing any feature, refactoring code, or responding to user requests, read and strictly adhere to:
1. **[`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/AGENTS.md)** — Core product, workflow, architecture, prompt generation, and security requirements.
2. **[`context/project-overview.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/project-overview.md)** — Product definition, goals, and scope boundaries.
3. **[`context/architecture.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/architecture.md)** — System architecture, data flow, SQLite WAL config, and indexing.
4. **[`context/code-standards.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/code-standards.md)** — Code quality, FastAPI best practices, and implementation rules.
5. **[`context/ai-workflow-rules.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/ai-workflow-rules.md)** — Phase-by-phase implementation stages, 10-step prompt workflow, and multi-commit rules.
6. **[`context/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/progress-tracker.md)** — Progress, status, and active tasks.
7. **[`context/ui-context.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/ui-context.md)** — Frontend integration, CORS settings, and API contract specifications.

---

## 2. Core 10-Step Workflow

For every implementation request:
1. Read `AGENTS.md`.
2. Read the skills explicitly mentioned by the user (e.g. `.agents/skills/fastapi`).
3. Read clearly needed supporting context files.
4. Inspect relevant code.
5. Ask a focused question only if the task has meaningful ambiguity.
6. Create a detailed prompt file in `prompts/`.
7. Ask: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
8. On approval, re-read the approved prompt file in `prompts/` and implement it strictly. Implement only after user approval.
9. Run available checks (`pytest`).
10. Share exact steps to test or run the completed feature and execute the **multiple atomic commits** for that phase.

**Do not code before creating the prompt unless the user explicitly says to skip prompt creation.**

---

## 3. Mandatory Git Commit Standards: Multiple Atomic Commits per Phase

Every phase completion must include **at least two distinct, granular, atomic commits** representing progressive steps in architecture and implementation.

All commits must strictly follow:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `tests:` for tests addition and modification
- `chore:` for maintenance tasks and environment setup

---

## 4. Key Engineering Standards

- **Strict Layer Separation**: API routes in `app/routers/` remain thin; all queries and calculations reside in `app/services/`.
- **SQLite WAL Mode**: Configure `PRAGMA journal_mode=WAL;` and `PRAGMA busy_timeout=5000;` on engine initialization.
- **FastAPI & Python Best Practices**: Adhere to `.agents/skills/fastapi` (`Annotated` typing, explicit return types, no ellipsis, no `RootModel`).
- **Universal Soft-Delete Filtering**: Every query must filter `is_deleted == False`.
