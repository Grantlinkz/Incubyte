# AI Workflow Rules: ACME Global Salary Management

## 1. Development Approach
Build the ACME Global Compensation application incrementally using a **spec-driven implementation workflow**. Specifications in `context/` and `assesesment details/` define the product scope, API contracts, and UI design tokens. Always implement against these specifications rather than inventing arbitrary behaviors.

---

## 2. Phased Execution Roadmap

### Phase 0: Requirements & Data Design (Completed)
- 1-page requirements document, scope, out-of-scope tradeoffs, and schema design.
- Define FastAPI REST contract (pagination, filtering, aggregation endpoints for HR analytics).

### Phase 1: API Contract & Client Setup
- Set up Axios client with FastAPI base URL (`lib/api-client.ts`).
- Define TypeScript types and Zod schemas matching backend Pydantic models (`lib/validations/employee.ts`).
- Set up MSW handlers for deterministic testing.

### Phase 2: Frontend Implementation
- **Step 1: Dashboard Analytics & KPI Visualizations ("How ACME Pays")**:
  - Implement `components/dashboard/kpi-metrics-strip.tsx` (4 stat cards).
  - Implement `components/dashboard/compensation-charts.tsx` (Department horizontal bar chart + Geographic spend chart).
- **Step 2: Server-Side Data Grid (TanStack Table & shadcn/ui)**:
  - Implement `components/employees/table-toolbar.tsx` (debounced search, faceted multi-selects, CSV export).
  - Implement `components/employees/employee-data-table.tsx` with manual pagination, sorting, and sticky action column.
- **Step 3: CRUD Workflows & Form Validation**:
  - Implement `components/employees/employee-modal.tsx` with Zod validation & Salary Diff Comparison Card.
  - Implement `components/employees/delete-dialog.tsx` for soft deletion.
  - Implement `components/employees/salary-history-sheet.tsx` for adjustment history timeline.
  - Implement `components/employees/csv-import-modal.tsx` with drag-and-drop & 5-row preview table.
- **Step 4: Loading, Error & Toast States**:
  - Skeleton loaders for stat cards, charts, and table rows during TanStack Query fetching.
  - Sonner toast notifications for mutations and error rollbacks.

### Phase 3: Verification & Integration
- Unit testing with Vitest (Zod schemas, salary diff calculations).
- Integration testing with MSW (table filtering, sorting, pagination, mutation rollbacks).
- Production build validation (`npm run build`, `npm run lint`).

---

## 3. Commit Conventions & Automation Rules

Every phase must produce clear, descriptive, incremental commits adhering to the following rules:

### Commit Prefix Conventions
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `tests:` for tests addition and modification
- `chore:` for maintenance tasks and environment setup

### Required Commit Cadence
1. **Minimum 2 Commits Per Phase**: Each phase must be broken down into at least 2 distinct commits demonstrating iterative development (e.g. foundational scaffolding/types first, followed by feature completion and tests).
2. **Auto-Commit Trigger**: After completing each phase and verifying that all tests and lint checks pass, automatically execute git commit commands without manual prompting.

---

## 4. Scoping & Incremental Delivery Rules
- **One Feature Unit at a Time**: Complete and verify each component before proceeding to the next.
- **Verification Gates**: After completing a feature unit, run `npm run lint` and relevant tests.
- **Keep Progress Tracker Updated**: Log completed units, decisions, and next steps in `context/progress-tracker.md`.

---

## 5. Protected Files
Do not alter generated UI library base primitives in `components/ui/` unless adding new shadcn components or styling fixes directly required by the design system.
