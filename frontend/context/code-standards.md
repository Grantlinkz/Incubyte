# Code Standards: ACME Global Salary Management

## 1. General Principles
- **Single Responsibility**: Keep components and utilities focused on one explicit task.
- **Root-Cause Resolution**: Fix bugs and validation errors at the root schema/state layer; avoid layering ad-hoc UI workarounds.
- **Declarative Server State**: Rely on TanStack Query for server state caching and synchronization; do not duplicate server data in local `useState`.

---

## 2. TypeScript & Data Integrity
- **Strict Mode**: `strict: true` is enforced across all TypeScript files.
- **No `any`**: Use explicit interfaces, generics, or narrowly typed unions.
- **Schema-First Validation**: Use Zod schemas in `lib/validations/` to parse and validate all user inputs, CSV uploads, and API responses.
- **Backend Contract Alignment**: All payload properties interacting with the FastAPI backend must adhere to backend `snake_case` naming conventions (`base_salary`, `salary_usd`, `employment_type`, etc.).

---

## 3. Next.js & React Conventions
- **Client vs. Server Boundaries**:
  - Keep root pages and wrapper shells as Server Components where feasible.
  - Apply `'use client'` to interactive leaf components (data tables, modals, charts, toolbars).
- **Custom Hooks**: Encapsulate TanStack Query logic in dedicated hooks (`useEmployees`, `useAnalytics`) rather than invoking queries directly in UI views.
- **Optimistic Updates**: Mutating hooks (`useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee`) must optimistically update the query cache and restore previous state if the mutation fails, emitting Sonner toasts for user feedback.

---

## 4. TanStack Table Conventions
- **Server-Driven Mode**: Must use manual table modes:
  ```ts
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    // ...
  });
  ```
- **URL Parameter Binding**: Filter, search, and pagination triggers must update the URL search params so table state remains shareable and bookmarkable.
- **Debounced Search**: Text searches on name, email, and job title must debounce for 300ms before triggering API requests.

---

## 5. Forms & Workflow Overlays
- **Form Management**: Use `react-hook-form` paired with `@hookform/resolvers/zod`.
- **Salary Diff Calculation**: Edit modals must compute and display real-time numeric diffs (`current vs. proposed` salary and percentage change) before the user confirms the update.
- **CSV Ingestion**: Validate CSV structure in-browser using Zod against the first 5 rows before dispatching `POST /api/employees/batch-import`.

---

## 6. Styling & Design Tokens
- **Zero Arbitrary Colors**: Use Tailwind utility tokens mapping to CSS variables defined in `context/ui-context.md` and `app/globals.css`.
- **High Data Density**: Keep table cell heights compact (48px) with monospace tabular numbers for salaries and percentages.
- **Accessible Interactions**: Ensure all interactive buttons, dialog triggers, and dropdowns support full keyboard navigation and Radix UI ARIA semantics.

---

## 7. Testing Standards
- **Unit Testing (Vitest)**:
  - Test Zod validation rules against edge cases (negative numbers, empty strings, invalid currency codes, malformed emails).
  - Test salary diff calculation utilities and currency formatters.
- **Integration Testing (MSW + React Testing Library)**:
  - Mock FastAPI endpoints (`/api/employees`, `/api/analytics/*`) using MSW handlers.
  - Verify table rendering, pagination, filter state updates, and optimistic delete rollbacks on error.

---

## 8. Directory Organization
- `app/` — Global layout, providers, and main dashboard route.
- `components/dashboard/` — KPI stat cards and Recharts analytical visualization components.
- `components/employees/` — High-density data grid, table toolbar, CRUD modals, CSV import, and history slide-over.
- `components/ui/` — Atomic shadcn/ui primitives (Button, Dialog, Card, Table, Select, Skeleton, etc.).
- `hooks/` — Custom TanStack Query hooks for employees, analytics, and URL state.
- `lib/` — Axios API client, currency and math utilities, and Zod schemas.
- `__tests__/` — Vitest unit and MSW integration test suites.

---

## 9. Git & Commit Conventions

All commits across the repository must strictly follow the conventional prefix formatting below:

### Commit Prefix Conventions
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `tests:` for tests addition and modification
- `chore:` for maintenance tasks and environment setup

### Commit Cadence & Automation Rules
1. **Minimum Commits Per Phase**: At least **2 commits per phase** to clearly document the architectural progression (e.g. initial structure/contracts followed by core implementation/verification).
2. **Phase Auto-Commit**: Automatically stage and commit code via git commands immediately upon completing each implementation phase or sub-phase unit after verification checks pass.
