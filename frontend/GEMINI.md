# GEMINI.md

This document defines the agent instructions, project architecture, operational constraints, and workflow conventions for the **ACME Global Salary Management** web application.

---

## 1. Primary Directive & Master Context

> [!IMPORTANT]
> The primary authority for technical specifications, API contracts, design tokens, architecture boundaries, and implementation workflows is:
> **[`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/AGENTS.md)**

All development must align strictly with the rules and guidelines defined in [`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/AGENTS.md) and the supporting context documents in [`context/`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/):

- [`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/AGENTS.md): Master specification for ACME Global Salary Management (scope, architecture, API contracts, design system, workflow, and verification).
- [`context/project-overview.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/project-overview.md): Product definition, user persona (HR Manager), core flows, features, out-of-scope tradeoffs, and success criteria.
- [`context/architecture.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/architecture.md): System boundaries, directory hierarchy, FastAPI API contracts, URL state synchronization, and architectural invariants.
- [`context/ui-context.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/ui-context.md): UI styling tokens (Dark/Light modes), typography scale (Inter), high-density layout patterns, and component specifications.
- [`context/code-standards.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/code-standards.md): Coding rules, TypeScript strictness, TanStack Query/Table conventions, Zod validation, and testing standards.
- [`context/ai-workflow-rules.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/ai-workflow-rules.md): Phased execution roadmap, scoping rules, and verification gates.
- [`context/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/progress-tracker.md): Current phase, active goals, completed features, and architecture decisions.

---

## 2. Project Overview & Tech Stack

**ACME Global Salary Management** is a centralized, high-performance web-based platform built for HR Managers to manage compensation for 10,000+ global employees across multiple international offices. It delivers instant analytical insights ("How ACME Pays"), a server-driven paginated data grid, dual-currency visualization, CRUD workflows with live salary diff previews, batch CSV ingestion, and salary adjustment audit histories.

### Technology Stack
- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript 5
- **Styling & UI**: Tailwind CSS v4, shadcn/ui base primitives (`@base-ui/react` / `@radix-ui`), Lucide React, Sonner
- **State & Data Fetching**: TanStack React Query v5 (server state caching, pagination, sorting, optimistic updates)
- **Table Engine**: TanStack React Table v9 (server-driven manual pagination/sorting)
- **Form Management**: React Hook Form + Zod (`@hookform/resolvers/zod`)
- **Data Visualizations**: Recharts (Horizontal bar chart for departments, Grouped bar/Donut chart for countries)
- **API Client**: Axios configured with FastAPI backend URL and snake_case contract alignment
- **Testing**: Vitest, React Testing Library, Mock Service Worker (MSW)

---

## 3. Mandatory Agent Workflow

For every feature or implementation request, follow the 10-step protocol:

1. **Read Master Spec**: Review [`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/AGENTS.md) and related files in [`context/`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/).
2. **Review Skills**: Consult skills under `.agents/skills/` (e.g., `shadcn`, `next-dev-loop`, `migrate-radix-to-base`).
3. **Inspect Code**: Examine existing components in `components/`, schemas in `lib/validations/`, and route handlers in `app/`.
4. **Clarify Ambiguities**: Ask targeted questions only when requirements have significant gaps.
5. **Create Implementation Prompt**: Draft a detailed plan in `prompts/<feature-name>.md` containing:
   - Goal & scope
   - Skills & code inspected
   - Architectural decisions & assumptions
   - Files to modify or create
   - Acceptance criteria & verification checks
   - Manual test steps
6. **Request Approval**: Prompt the user:
   > *"I prepared the implementation prompt at `prompts/<file-name>.md`. Is this good to execute?"*
7. **Execute on Approval**: Follow the approved prompt strictly upon confirmation.
8. **Run Verification Checks**: Execute `npm run lint` and `npm run build` as appropriate.
9. **Update Documentation**: Log progress and architecture decisions in [`context/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/progress-tracker.md).
10. **Auto-Commit**: Automatically stage and commit code adhering to the commit prefix conventions (minimum 2 commits per phase).
11. **Provide Test Instructions**: Share exact steps and expected outputs for user testing.

---

## 4. Architectural Boundaries & System Invariants

1. **Server-Driven Data Grid**: TanStack Table must run in manual mode (`manualPagination: true`, manualSorting: true, manualFiltering: true). Do not perform client-side slicing over the 10,000-record dataset.
2. **Dual Currency Display**: Render both native compensation (`£75,000 + £5,000`) and normalized base currency (`$98,250 USD`) across employee rows and analytics cards.
3. **URL State Synchronization**: Synchronize table filters, debounced search (300ms), and pagination with URL search parameters using backend `snake_case` keys (`?page=1&limit=25&department=Engineering&sort_by=base_salary&sort_order=desc`).
4. **Strict Schema Validation**: Validate all form inputs and CSV uploads using Zod schemas matching backend Pydantic models before dispatching network requests.
5. **Optimistic Updates & Toast Rollbacks**: Mutating hooks must update the TanStack Query cache optimistically and roll back with Sonner error toasts on API failures.

---

## 5. Commit Conventions & Automated Cadence

### Commit Prefix Conventions
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `tests:` for tests addition and modification
- `chore:` for maintenance tasks and environment setup

### Rules
- **At least 2 commits per phase** to reflect progressive implementation.
- **Auto-commit**: Immediately stage and commit verified changes upon phase completion using git commands.

---

## 6. UI Design & Enterprise Styling

- **Design Aesthetic**: Restrained, "quiet authority" enterprise aesthetic inspired by Linear and shadcn/ui.
- **Theme Support**: High-contrast Dark Mode (`acme_global_1`) and Clean Light Mode (`acme_global_2`).
- **Data Density**: 48px fixed table row height, clean 1px borders, compact padding, and monospace formatting for numeric compensation values.

---

## 7. Verification Commands

```bash
# Lint codebase with ESLint
npm run lint

# Validate production Next.js build
npm run build

# Start local Next.js dev server
npm run dev
```
