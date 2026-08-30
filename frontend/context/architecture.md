# Architecture Context: ACME Global Salary Management

## Stack

| Layer | Technology | Role |
| ----- | ---------- | ---- |
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript 5 | Core frontend application, server rendering, routing |
| **UI & Styling** | Tailwind CSS v4 + shadcn/ui base primitives (`@radix-ui` / `@base-ui/react`) | Design system, layout, high-density enterprise components |
| **State & Data Fetching** | TanStack React Query v5 | Server state caching, pagination, sorting, background refetching, optimistic updates |
| **Table Engine** | TanStack React Table v9 | Server-driven data grid with manual pagination, sorting, and faceted filtering |
| **Form Management & Validation** | React Hook Form + Zod | Schema validation matching backend Pydantic models with real-time feedback |
| **Data Visualizations** | Recharts | Departmental and geographic compensation analytics charts |
| **HTTP Client** | Axios | Typed HTTP client configured with FastAPI base URL and snake_case contracts |
| **Feedback / Notifications** | Sonner | Toast notifications for CRUD mutations, imports, exports, and rollback alerts |
| **Testing** | Vitest + React Testing Library + MSW | Deterministic unit tests (schemas, math) and integration tests (MSW mocked API) |

---

## System Boundaries & Directory Hierarchy

```
frontend/
├── app/
│   ├── layout.tsx                # Root layout & TanStack QueryClientProvider + Sonner Toaster
│   └── page.tsx                  # Main HR Dashboard (Header + Analytics + Employee Data Grid)
├── components/
│   ├── dashboard/
│   │   ├── kpi-metrics-strip.tsx # Top-level summary stat cards (USD totals, avg, median, headcount)
│   │   └── compensation-charts.tsx # Departmental & Regional distribution charts (Recharts)
│   ├── employees/
│   │   ├── employee-data-table.tsx # TanStack Table wrapper with server-side pagination & sorting
│   │   ├── table-toolbar.tsx     # Debounced search, faceted multi-select filters, and CSV export
│   │   ├── employee-modal.tsx    # Add/Edit employee modal with salary diff preview
│   │   ├── delete-dialog.tsx     # Soft-delete confirmation alert dialog
│   │   ├── csv-import-modal.tsx  # Bulk CSV drag-and-drop ingestion dialog with preview
│   │   └── salary-history-sheet.tsx # Slide-over drawer showing employee compensation adjustments
│   └── ui/                       # shadcn/ui components (Card, Dialog, Table, Select, Skeleton, etc.)
├── hooks/
│   ├── use-employees.ts          # TanStack Query hooks for employee CRUD, pagination, and export
│   └── use-analytics.ts          # TanStack Query hooks for summary, department, and country metrics
├── lib/
│   ├── api-client.ts             # Base Axios client configured with FastAPI backend URL
│   ├── utils.ts                  # Currency formatting, cn helper, number utilities
│   └── validations/
│       └── employee.ts           # Zod validation schema matching backend Pydantic models
└── __tests__/
    ├── employee-table.test.tsx   # Unit & integration tests for table rendering and pagination
    └── employee-form.test.tsx    # Form validation and submission tests with MSW
```

---

## API Contract & Backend Communication Model

The frontend communicates with a **FastAPI** backend exposing RESTful endpoints with snake_case parameters and JSON responses:

### 1. Analytics Endpoints
- `GET /api/analytics/summary?currency={USD|EUR|GBP}`
  - Returns: Total payroll, average salary, median salary, headcount by status, currency breakdown.
- `GET /api/analytics/by-department?currency={USD|EUR|GBP}`
  - Returns: Departmental spend list (`department`, `total_payroll`, `avg_salary`, `headcount`).
- `GET /api/analytics/by-country?currency={USD|EUR|GBP}`
  - Returns: Geographic spend list (`country`, `total_payroll`, `avg_salary`, `headcount`).

### 2. Employee Endpoints
- `GET /api/employees`
  - Query params: `page` (int), `limit` (int), `search` (string), `department` (string[]), `country` (string[]), `employment_type` (string[]), `status` (string[]), `sort_by` (string), `sort_order` (`asc`|`desc`).
  - Returns: `{ items: Employee[], total: number, page: number, limit: number, total_pages: number }`.
- `POST /api/employees`: Create employee profile.
- `PUT /api/employees/:id`: Update employee profile and record salary change note.
- `DELETE /api/employees/:id`: Soft-delete employee record.
- `GET /api/employees/:id/history`: Fetch compensation adjustment history and notes.
- `POST /api/employees/batch-import`: Upload validated CSV/XLSX payload.
- `GET /api/employees/export`: Direct streaming CSV download matching current filter criteria.

---

## URL State Synchronization

All table state is bidirectional with URL search parameters to ensure link shareability, browser history navigation, and deterministic reloads:
- `page`: Current page number (1-indexed, default: `1`).
- `limit`: Page size (`10`, `25`, `50`, `100`, default: `25`).
- `search`: Debounced search string (300ms delay).
- `department`, `country`, `employment_type`, `status`: Multi-value filter arrays.
- `sort_by`: Sort column identifier (`base_salary`, `bonus`, `salary_usd`, `name`, etc.).
- `sort_order`: `asc` or `desc`.
- `currency`: Selected global display currency (`USD`, `EUR`, `GBP`).

---

## Architectural Invariants

1. **Server-Driven Data Grid**: TanStack Table must run in manual mode (`manualPagination: true`, `manualSorting: true`, `manualFiltering: true`). The frontend must not perform client-side slicing on the 10,000-record dataset.
2. **Dual Currency Representation**: Every compensation record must preserve and render its native currency and amount alongside the standardized base-currency equivalent (`salary_usd`).
3. **Strict Validation at System Boundaries**: React Hook Form forms must validate using Zod schemas that strictly mirror backend Pydantic models before dispatching network requests.
4. **Optimistic Mutations & Graceful Rollback**: Create, update, and soft-delete mutations update the TanStack Query cache optimistically and roll back with Sonner error toasts on API rejection.
5. **Separation of Presentation & Data**: UI components render data passed via custom hooks (`useEmployees`, `useAnalytics`); no ad-hoc inline fetch calls inside component bodies.
