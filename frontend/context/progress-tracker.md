# Progress Tracker: ACME Global Salary Management

## Current Phase
- **Phase 2: In Progress** (Step 1 & Step 2 Completed; Ready for Step 3: Interactive Modals & Workflow Overlays)

## Current Goal
- Implement Interactive Modals & Workflow Overlays (`employee-modal.tsx` with salary diff preview, `delete-dialog.tsx`, `salary-history-sheet.tsx`, `csv-import-modal.tsx`).

---

## Phase Breakdown

### Phase 0: Requirements & Data Design
- [x] Product Requirements Document & Scope definitions created from assessment files.
- [x] FastAPI REST contract defined (Analytics, Employees, CRUD, Batch Import, Export).
- [x] Context documents updated (`project-overview.md`, `architecture.md`, `ui-context.md`, `code-standards.md`, `ai-workflow-rules.md`).

### Phase 1: API Client, Types & Global Header Control Bar
- [x] TypeScript domain interfaces and contracts (`lib/types.ts`).
- [x] Zod validation schemas for employees, CSV rows, and query parameters (`lib/validations/employee.ts`).
- [x] Base Axios client configured with FastAPI endpoints and error interceptors (`lib/api-client.ts`).
- [x] Currency formatting, math, and salary diff helpers (`lib/utils.ts`).
- [x] Deterministic mock data generator (10,000 records) and analytics calculation engine (`lib/mock-data.ts`).
- [x] Base currency URL state synchronization hook (`hooks/use-currency.ts`).
- [x] Theme system with high-contrast Dark Mode (`acme_global_1`) and clean Light Mode (`acme_global_2`) (`app/globals.css`, `components/layout/theme-toggle.tsx`).
- [x] Global Header & Control Bar with branding, live status badge, currency dropdown, and action buttons (`components/layout/global-header.tsx`).
- [x] TanStack Query, NextThemes, and Sonner providers integration (`app/providers.tsx`, `app/layout.tsx`).

### Phase 2: Frontend Implementation
- [x] **Step 1**: Top Section Analytics & KPI Visualizations (`kpi-metrics-strip.tsx`, `compensation-charts.tsx`).
- [x] **Step 2**: Server-Driven Employee Data Grid (`table-toolbar.tsx`, `employee-data-table.tsx` with TanStack Table).
- [ ] **Step 3**: Interactive Modals & Workflow Overlays (`employee-modal.tsx` with salary diff preview, `delete-dialog.tsx`, `salary-history-sheet.tsx`, `csv-import-modal.tsx`).
- [ ] **Step 4**: Loading Skeletons, Error Boundaries, and Sonner Toast Feedback.

### Phase 3: Verification, Polish & Deployment
- [ ] Vitest unit tests for Zod validation and salary diff calculations.
- [ ] MSW integration tests for search, filtering, pagination, and mutation rollbacks.
- [ ] Final production build check (`npm run build`).

---

## Architecture Decisions
1. **Server-Driven Data Grid**: Configured TanStack Table with manual pagination, sorting, and filtering to scale smoothly to 10,000+ employee records without frontend performance degradation.
2. **Dual Currency Display**: Retaining both local native compensation and converted base currency (`salary_usd`) ensures international pay transparency and accurate aggregation.
3. **URL State Synchronization**: Keeping search queries, faceted filters, page size, currency, and sorting state in URL search parameters ensures high shareability and smooth browser navigation.
4. **Deterministic Mock Layer**: In-memory 10,000 record PRNG generator enables instant offline testing and accurate multi-currency analytics calculations matching backend FastAPI logic.

---

## Session Notes
- Phase 1 foundation successfully established and verified against design mockups and TypeScript standards.
