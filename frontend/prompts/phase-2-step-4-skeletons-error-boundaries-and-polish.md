# Implementation Plan: Phase 2 Step 4 — Skeletons, Error Boundaries & Polish

## Goal & Scope
Implement Phase 2 Step 4 for ACME Global Salary Management to deliver resilient state handling, graceful degradations, loading states, and error feedback:
1. **High-Density Skeletons (`components/ui/skeleton-states.tsx`)**:
   - `KpiStripSkeleton`: Matching 4-card metric strip pulse layout.
   - `CompensationChartsSkeleton`: Departmental horizontal bar chart and country donut/bar skeletons.
   - `TableSkeleton`: 48px fixed height rows with simulated column widths for table loading.
2. **Global & Sectional Error Boundaries (`components/ui/error-boundary.tsx`, `components/ui/query-error-fallback.tsx`)**:
   - Resilient error boundary catching rendering or hydration issues with retry triggers.
   - TanStack Query error retry components for analytics and employee grid failure states.
3. **Empty States & Zero-Result Views (`components/ui/empty-state.tsx`)**:
   - Contextual empty state with reset filters button when table search/filters return 0 matching employees.
4. **Enhanced Toast & Feedback Styling**:
   - High-contrast enterprise toast styling with custom theme-aware icons.
5. **Dashboard Polish & Integration (`app/page.tsx`, `components/employees/employee-data-table.tsx`, `components/dashboard/kpi-metrics-strip.tsx`, `components/dashboard/compensation-charts.tsx`)**:
   - Wrap dashboard widgets in suspense and error boundaries.
   - Smooth loading transitions without layout shifts.

---

## Inspected Code & Reference Artifacts
- Master Spec: `context/AGENTS.md` and `context/progress-tracker.md`
- UI Designs: `assesesment details/acme ui/`
- Existing Components:
  - `components/ui/skeleton.tsx`
  - `components/dashboard/kpi-metrics-strip.tsx`
  - `components/dashboard/compensation-charts.tsx`
  - `components/employees/employee-data-table.tsx`
  - `app/page.tsx`

---

## Architectural Decisions & Assumptions
1. **Zero Layout Shifts (CLS 0)**: Skeletons have exact dimension parity with populated components to prevent layout shifts during network fetches.
2. **Isolated Error Boundaries**: Chart failures or table query errors should not crash the entire application; each major section has its own graceful error fallback with retry capability.
3. **Optimistic Error Rollback**: API mutations show instant visual feedback with automatic rollback and Sonner error notification if backend fails.

---

## Files to Modify & Create

### 1. New Components
- [NEW] `components/ui/query-error-fallback.tsx`: Section-specific query error fallback with reload action.
- [NEW] `components/ui/empty-state.tsx`: Reusable enterprise empty state with actions.
- [NEW] `components/ui/skeleton-states.tsx`: Specialized skeleton loaders for KPI strip, charts, and data tables.

### 2. Modified Files
- [MODIFY] `components/dashboard/kpi-metrics-strip.tsx`: Integrate `KpiStripSkeleton` and query error handling.
- [MODIFY] `components/dashboard/compensation-charts.tsx`: Integrate `CompensationChartsSkeleton` and query error handling.
- [MODIFY] `components/employees/employee-data-table.tsx`: Integrate `TableSkeleton` and `EmptyState`.
- [MODIFY] `app/page.tsx`: Connect error handling, skeletons, and graceful fallbacks.
- [MODIFY] `context/progress-tracker.md`: Mark Phase 2 Step 4 completed upon verification.

---

## Acceptance Criteria & Verification Checks
- [ ] During data fetching, KPI strip, charts, and table display seamless skeletons without layout shift.
- [ ] Filtering with an impossible query displays the `EmptyState` component with a working "Reset Filters" action button.
- [ ] If an API query fails, section renders `QueryErrorFallback` with a functional "Retry" button.
- [ ] ESLint checks pass with 0 errors.

---

## Manual Test Steps
1. Navigate to `/` -> Observe initial skeleton loading states transition smoothly into loaded cards.
2. In table toolbar search, type non-existent string like `xyz9999` -> Observe `EmptyState` -> Click "Reset Filters" -> Verify full table returns.
3. Trigger actions and verify Sonner toast feedback and theme consistency in Dark and Light modes.
