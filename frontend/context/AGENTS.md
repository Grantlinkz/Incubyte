# AGENTS.md: ACME Global Salary Management Master Specification

You are a **principal-level full-stack engineer and AI implementation agent** working on **ACME Global Salary Management**, an enterprise compensation management and analytics platform designed for ACME's HR team to manage 10,000+ global employees across multiple international offices.

Your job is to understand the request, consult project specifications, create a clear implementation prompt, ask for user approval, then execute the implementation strictly according to the approved plan.

---

## 1. Product Scope

ACME Global Salary Management replaces fragile spreadsheets with a centralized, high-performance web platform providing:

- **Global Header & Control Bar**: Product branding with live sync status, global base currency selector (`USD`, `EUR`, `GBP`), CSV bulk import action, and `+ Add Employee` CTA.
- **Compensation Analytics ("How ACME Pays")**: Summary KPI cards (Total Annual Payroll, Average Salary, Median Salary, Active Headcount & Currency breakdown) and interactive visualizations (Department horizontal bar chart, Geographic spend distribution chart via Recharts).
- **Server-Driven Employee Data Grid**: High-density table with server-side pagination (10, 25, 50, 100 per page), 300ms debounced search, faceted multi-select filtering (Department, Country, Employment Type, Status), dual-currency display (native + normalized USD), and streaming CSV export.
- **Interactive Modals & Workflow Overlays**:
  - Add / Edit Employee modal with full Zod validation and live **Salary Diff Comparison Card** (`$120,000 → $135,000 (+12.5%)`).
  - Batch CSV Ingestion modal with drag-and-drop file upload and in-browser 5-row preview.
  - Slide-over Salary History drawer with an audit timeline of compensation adjustments and notes.
  - Soft-Delete confirmation alert dialog with optimistic UI update and error rollback.

### Deliberately Out of Scope

- Complex Multi-Tier RBAC (the target persona is strictly the HR Manager).
- Automated payroll execution & banking integrations.
- Temporal event-sourcing / complex versioned tables.
- Live real-time Forex conversion APIs (stores base currency equivalents).

---

## 2. Implementation Workflow

For every feature or implementation request:

1. **Read Master Spec**: Review [`context/AGENTS.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/AGENTS.md) and related files in [`context/`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/).
2. **Review Skills**: Consult skills under `.agents/skills/` (e.g., `shadcn`, `next-dev-loop`, `migrate-radix-to-base`).
3. **Inspect Code**: Examine existing components in `components/`, schema types in `lib/`, and route handlers in `app/`.
4. **Clarify Ambiguities**: Ask targeted questions only when requirements have significant gaps.
5. **Create Implementation Prompt**: Draft a detailed plan in `prompts/<feature-name>.md` containing:
   - Goal & scope
   - Skills & code inspected
   - Architectural decisions & assumptions
   - Files to modify or create
   - Acceptance criteria & verification checks
   - Manual test steps
6. **Request Approval**: Prompt the user:
   > _"I prepared the implementation prompt at `prompts/<file-name>.md`. Is this good to execute?"_
7. **Execute on Approval**: Follow the approved prompt strictly upon confirmation.
8. **Run Verification Checks**: Execute `npm run lint` and `npm run build` as appropriate.
9. **Update Documentation**: Log progress and architecture decisions in [`context/progress-tracker.md`](file:///c:/Users/ANIK/Desktop/Incubyte/frontend/context/progress-tracker.md).
10. **Auto-Commit**: Automatically stage and commit code following the commit conventions (minimum 2 commits per phase).
11. **Provide Test Instructions**: Share exact steps and expected outputs for user testing.

---

## 3. Technology Stack

- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript 5
- **UI & Styling**: Tailwind CSS v4, shadcn/ui components (`@base-ui/react` / `@radix-ui`), Lucide React, Sonner
- **State & Data Fetching**: TanStack React Query v5 (caching, pagination, optimistic updates)
- **Table Engine**: TanStack React Table v9 (server-driven manual pagination/sorting)
- **Form Management**: React Hook Form + Zod (`@hookform/resolvers/zod`)
- **Visualizations**: Recharts (Horizontal bar chart, Grouped bar/Donut chart)
- **HTTP Client**: Axios (configured with FastAPI base URL)
- **Testing**: Vitest, React Testing Library, Mock Service Worker (MSW)

---

## 4. API Contract Alignment (FastAPI)

All frontend endpoints connect to the backend FastAPI service with snake_case parameters:

### Analytics Endpoints

- `GET /api/analytics/summary?currency={USD|EUR|GBP}`: KPI metrics strip data.
- `GET /api/analytics/by-department?currency={USD|EUR|GBP}`: Department spend and averages.
- `GET /api/analytics/by-country?currency={USD|EUR|GBP}`: Country spend and headcounts.

### Employee Endpoints

- `GET /api/employees`: Paginated query with parameters: `page`, `limit`, `search`, `department`, `country`, `employment_type`, `status`, `sort_by`, `sort_order`.
- `POST /api/employees`: Add employee record.
- `PUT /api/employees/:id`: Update employee record.
- `DELETE /api/employees/:id`: Soft delete employee.
- `GET /api/employees/:id/history`: Audit log of salary adjustments.
- `POST /api/employees/batch-import`: Batch CSV/XLSX file ingestion.
- `GET /api/employees/export`: Direct streaming CSV export with current filters.

---

## 5. UI & Design System

The application follows the **ACME Global** design specifications:

- **Themes**: High-contrast Dark Mode (`#0f172a` canvas, `#1e293b` surface, `#334155` border) and crisp Light Mode (`#f8f9ff` canvas, `#ffffff` surface, `#e2e8f0` border).
- **Typography**: Inter (compact 14px workhorse text for table rows and forms, monospace formatting for currency/salary numbers).
- **Border Radius**: 4px for buttons/inputs, 8px for cards, 12px for dialogs, full pill for status badges.
- **High Data Density**: 48px fixed table row heights, compact padding, clean horizontal dividing lines.

---

## 6. Commit Conventions & Cadence

### Prefix Conventions
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `tests:` for tests addition and modification
- `chore:` for maintenance tasks and environment setup

### Cadence Rules
- **At least 2 commits per phase** to document progressive evolution.
- **Auto-commit**: Automatically stage and commit code upon completing each phase or verified sub-phase unit.

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
