# Implementation Prompt: Phase 2 Step 2 — Server-Driven Employee Data Grid & Table Toolbar

## 1. Goal & Scope
Implement the high-performance, server-driven **Employee Roster** data grid and interactive table toolbar matching the specifications in `3 acme_compensation_employee_directory_dark_mode` and `3 acme_compensation_employee_directory_light_mode`.

### Scope
1. **Employee TanStack Query Hook (`hooks/use-employees.ts`)**:
   - `useEmployees(params: EmployeeFilterParams)`: Query hook supporting server-side pagination, sorting, text search, and faceted filtering (department, country, employment_type, status) with fallback to the deterministic 10,000-record mock engine.
   - `useExportEmployeesCsv(params: EmployeeFilterParams)`: Streaming client-side/server CSV export generator matching active filters.
   - Optimistic mutation hooks (`useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee`).
2. **Table Toolbar (`components/employees/table-toolbar.tsx`)**:
   - Search input with 300ms debouncing synchronizing with URL search params.
   - Faceted multi-select dropdown filters for Department, Country, Employment Type, and Status.
   - Active filter tags and "Reset Filters" action button.
   - Direct "Export CSV" trigger.
3. **Server-Driven Data Table (`components/employees/employee-data-table.tsx`)**:
   - TanStack React Table v9 configured with `manualPagination: true`, `manualSorting: true`, `manualFiltering: true`.
   - Columns:
     - Multi-selection checkbox column
     - **Employee**: Avatar/initials, full name, and email
     - **Title & Dept**: Job title and department badge
     - **Location**: Flag emoji + City, Country code (`London, UK / EMEA-01`)
     - **Status**: Status indicator badge (`Active` emerald, `On Leave` amber, `Terminated` zinc)
     - **Local Comp**: Local currency salary (`£145,000`) + bonus annotation (`+£25K Bonus`)
     - **Norm Salary (USD)**: Standardized USD value in a monospace badge card (`$184,150`)
     - **Actions**: Sticky action dropdown (`Edit Profile`, `View Salary History`, `Delete Employee`)
   - 48px fixed row height with smooth hover highlights and selected row highlight (`bg-secondary-container/10`).
   - Server pagination footer: Record range display (`Showing 1–25 of 10,000 records`), rows per page selector (`10`, `25`, `50`, `100`), and numeric pagination with ellipsis (`1`, `2`, `3` ... `400`).
4. **Dashboard Integration (`app/page.tsx`)**:
   - URL state synchronization for `page`, `limit`, `search`, `department`, `country`, `employment_type`, `status`, `sort_by`, `sort_order`.
   - Mount toolbar and data table underneath the top analytics section.

---

## 2. Skills & Code Inspected
- `assesesment details/acme ui/3 acme_compensation_employee_directory_dark_mode/code.html` (Dark mode design)
- `assesesment details/acme ui/3 acme_compensation_employee_directory_light_mode/code.html` (Light mode design)
- `lib/types.ts` (`Employee`, `EmployeeFilterParams`, `PaginatedResponse`)
- `lib/mock-data.ts` (`queryMockEmployees`)
- `lib/utils.ts` (`formatCurrency`, `getCountryFlag`)
- `components/ui/table.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/select.tsx`, `components/ui/button.tsx`
- `context/AGENTS.md`, `context/architecture.md`, `context/code-standards.md`

---

## 3. Architectural Decisions & Assumptions
1. **Zero Client Slicing**: TanStack Table runs with `manualPagination: true`, `manualSorting: true`, `manualFiltering: true`, processing pagination and sorting on the server / mock service.
2. **URL Parameter Sync**: All filter, pagination, and sorting mutations update the URL search params so views are 100% shareable and bookmarkable.
3. **CSV Export**: Direct CSV generation respecting active filters and current sort order.
4. **Dual Currency Invariant**: Local compensation amounts and normalized USD values are rendered side-by-side in distinct columns.

---

## 4. Files to Modify or Create
- `[NEW]` `hooks/use-employees.ts`: TanStack Query hooks for employee pagination, filtering, export, and mutations.
- `[NEW]` `components/employees/table-toolbar.tsx`: Debounced search, faceted filter dropdowns, and CSV export.
- `[NEW]` `components/employees/employee-data-table.tsx`: Server-driven TanStack Table with 48px rows, custom column cells, sorting headers, and pagination controls.
- `[MODIFY]` `app/page.tsx`: Assemble TableToolbar and EmployeeDataTable with URL search params.
- `[MODIFY]` `context/progress-tracker.md`: Update Phase 2 Step 2 progress.

---

## 5. Acceptance Criteria & Verification Checks
- [ ] Employee data table renders 25 records per page with 48px row height.
- [ ] Text search filters across name, email, job title, and department with 300ms debounce.
- [ ] Department, Country, Employment Type, and Status filters correctly filter the 10,000 dataset.
- [ ] Sorting columns (Name, Base Salary, Salary USD, Department) updates sort order and direction.
- [ ] Pagination buttons and rows per page selector update table data and URL params.
- [ ] Export CSV downloads a formatted `.csv` file matching active filters.
- [ ] Dark Mode and Light Mode render with crisp contrast and no style artifacts.

---

## 6. Manual Test Steps
1. Navigate to `/` and scroll to the Employee Roster.
2. Type "Eleanor" into the search bar; verify debounced filtering to matching employees.
3. Select "Engineering" from the Department filter; verify only engineering employees appear.
4. Click on the "Local Comp" or "Norm Salary" column header to sort ascending/descending.
5. Click page `2` and change rows per page to `50`; verify the table displays 50 records.
6. Click "Export CSV" and verify the generated CSV download.
