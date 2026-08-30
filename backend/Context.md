## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. [`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/AGENTS.md) — master agent instructions, core product scope, 10-step prompt workflow, multiple atomic commits rule, and key engineering standards
2. [`context/project-overview.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/project-overview.md) — product definition, goals, features, and scope
3. [`context/architecture.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/architecture.md) — system structure, boundaries, SQLite WAL mode, storage model, and invariants
4. [`context/ui-context.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/ui-context.md) — frontend integration, API contracts, CORS, and latency targets
5. [`context/code-standards.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/code-standards.md) — implementation rules, FastAPI & Pydantic best practices, and SQLAlchemy conventions
6. [`context/ai-workflow-rules.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/ai-workflow-rules.md) — development workflow, prompt planning, phase roadmap, and atomic commit cadence
7. [`context/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/progress-tracker.md) — current phase, completed work, open questions, and next steps

Update [`context/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/Incubyte/backend/context/progress-tracker.md) after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.
