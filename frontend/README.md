# ACME Global Salary Management

> **High-Performance Global Compensation Intelligence & Workforce Salary Management Platform**  
> Built with Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, TanStack Query v5, and TanStack Table v9.

---

## 📌 Executive Summary

**ACME Global Salary Management** is a centralized, enterprise-grade web application tailored specifically for **HR Managers** and compensation executives to manage and analyze compensation for **10,000+ global employees** across international offices (United States, United Kingdom, Germany, Canada, Nigeria, etc.).

Replacing fragile and fragmented spreadsheets, the platform delivers instant analytical insights into organizational compensation structure (**"How ACME Pays"**), sub-second server-driven paginated data exploration, dual-currency visualization, interactive CRUD workflows with live salary diff previews, batch CSV ingestion, and full salary adjustment audit histories.

---

## ✨ Key Features & Capabilities

### 1. 📊 Compensation Analytics ("How ACME Pays")
- **KPI Metrics Strip**: Instant visibility into Total Annual Payroll (normalized base currency with period trends), Average Base Salary, Median Salary, and Active Headcount alongside dynamic currency breakdown pills.
- **Departmental Expenditure Visualizations**: Horizontal bar charts comparing total payroll allocation and average salaries across departments (Engineering, Sales, Product, Marketing, Operations, HR).
- **Geographic Spend Distributions**: Multi-metric breakdowns displaying headcount density and compensation expenditures across operating countries.

### 2. ⚡ Server-Driven Employee Data Grid
- **Scale-Optimized Grid**: Engineered with **TanStack Table v9** in manual mode (`manualPagination: true`, `manualSorting: true`, `manualFiltering: true`) to browse 10,000+ employee records with sub-second response times.
- **Faceted Filtering & Debounced Search**: Multi-select faceted filters (Department, Country, Employment Type, Status) and 300ms debounced global search across employee names, titles, and email addresses.
- **Deep URL State Synchronization**: Table search parameters, filters, page index, page size, sorting order, and active currency are synchronized directly to the browser URL for bookmarking and shareability.
- **Data Export**: One-click streaming CSV export respecting current filters and sorting parameters.

### 3. 💱 Dual-Currency Compensation Engine
- **Dual Display**: Renders both native local compensation (e.g., `£75,000 + £5,000`) and standardized normalized currency (e.g., `$98,250 USD`) across employee rows and analytics cards.
- **Global Currency Switcher**: Header dropdown toggling global normalized conversion across `USD ($)`, `EUR (€)`, and `GBP (£)`.

### 4. 🛠️ Interactive HR Workflows & Lifecycle Overlays
- **Add / Edit Employee Modal**: Two-column validated form powered by **React Hook Form** + **Zod**.
- **Live Salary Diff Preview**: Dynamically computes and displays percentage and absolute compensation adjustments (e.g., `$120,000 → $135,000 (+12.5%)`) in real-time as the manager edits base pay.
- **Salary History Slide-over Drawer**: Chronological audit trail showing past compensation adjustments, effective dates, and change notes.
- **Batch CSV Ingestion Modal**: Drag-and-drop file uploader with client-side CSV parsing and a 5-row schema validation preview table prior to submission.
- **Soft-Delete Alert Dialog**: Destructive confirmation dialog with optimistic UI removal and Sonner toast rollback on failure.

### 5. 🎨 Design & Accessibility
- **Enterprise Design System**: Restrained "quiet authority" aesthetic inspired by Linear and shadcn/ui.
- **Themes**: High-contrast Dark Mode (`acme_global_1`) and Clean Light Mode (`acme_global_2`) with system theme detection via `next-themes`.
- **Zero-CLS Skeletons & Resilient Error Fallbacks**: Custom high-density table and metric skeletons prevent Cumulative Layout Shifts (CLS); isolated section error boundaries keep unimpacted dashboard modules operational.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/) / [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **State & Fetching** | [TanStack React Query v5](https://tanstack.com/query/latest) (caching, optimistic updates, server state) |
| **Data Grid Engine** | [TanStack React Table v9](https://tanstack.com/table/latest) (server-driven manual pagination/sorting) |
| **Form & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (`@hookform/resolvers/zod`) |
| **Data Visualizations**| [Recharts](https://recharts.org/) (ResponsiveContainer, BarChart, Tooltips) |
| **HTTP Client** | [Axios](https://axios-http.com/) configured with interceptors and snake_case contract mapping |
| **Testing & QA** | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [MSW](https://mswjs.io/) (Mock Service Worker), [Happy-DOM](https://github.com/capricorn86/happy-dom) |

---

## 📁 Project Directory Structure

```text
frontend/
├── __tests__/                  # Comprehensive test suites (46 tests)
│   ├── components/             # Component tests (Table, Modal Form, Diff preview)
│   ├── integration/            # MSW-backed TanStack Query mutation tests
│   ├── utils/                  # Salary calculations and currency math tests
│   └── validations/            # Zod schema validation edge case tests
├── app/                        # Next.js App Router root
│   ├── globals.css             # Tailwind v4 theme variables (Dark & Light tokens)
│   ├── layout.tsx              # Root HTML shell with providers
│   ├── page.tsx                # Main dashboard page (Analytics + Employee Grid)
│   └── providers.tsx           # QueryClientProvider, ThemeProvider, Toaster
├── components/                 # Modular React UI components
│   ├── analytics/              # KPI metrics strip & Recharts visualizations
│   ├── layout/                 # GlobalHeader, Navigation, ThemeToggle
│   ├── modals/                 # EmployeeModal, CSVImportModal, SalaryHistorySheet, DeleteDialog
│   ├── table/                  # EmployeeDataTable, TableToolbar, TablePagination
│   └── ui/                     # Primitives (Button, Dialog, Badge, Input, Select, etc.)
├── context/                    # Master architecture and specification documents
├── hooks/                      # Custom React hooks (useCurrency, useDebounce, etc.)
├── lib/                        # Core utilities, API clients, and mock data engine
│   ├── api-client.ts           # Axios instance with FastAPI route handlers
│   ├── mock-data.ts            # Deterministic 10k-record generator & analytics engine
│   ├── types.ts                # Domain interfaces and API payload types
│   ├── utils.ts                # Currency formatting and salary diff calculations
│   └── validations/            # Zod validation schemas matching backend Pydantic models
├── vitest.config.ts            # Vitest configuration with path aliases & Happy-DOM
└── vitest.setup.ts             # Testing library setup and MSW lifecycle hooks
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+) or `pnpm` / `yarn`

### Installation

1. **Clone the repository and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env.local` file in the root of `frontend` (optional, defaults to local mock/FastAPI backend):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Testing

The project maintains a 100% pass rate across **46 deterministic unit, component, and integration tests** covering validation logic, mathematical calculations, UI behaviors, and mutation side effects:

```bash
# Run all Vitest test suites
npm run test

# Run tests in interactive watch mode
npm run test:watch

# Run ESLint validation
npm run lint

# Build production Next.js bundle
npm run build
```

### Test Suite Overview
- `employee-validation.test.ts` (15 tests): Verifies Zod validation rules (required fields, negative salary constraints, email syntax, CSV row parsing).
- `salary-calculations.test.ts` (18 tests): Validates percentage increase/decrease diffs, zero base edge cases, precision rounding, and multi-currency formatting.
- `employee-table.test.tsx` (6 tests): Validates high-density table rendering, column sorting, pagination controls, and empty state fallbacks.
- `employee-form.test.tsx` (4 tests): Tests Add/Edit modal states, field population, dynamic Salary Diff Card triggers, and validation error messages.
- `optimistic-mutations.test.tsx` (3 tests): Tests MSW-intercepted mutations, optimistic cache updates, and Sonner toast notifications.

---

## 🏛️ Architectural Principles & System Invariants

1. **Server-Driven Data Grid**: All pagination, filtering, and sorting are executed against backend query endpoints (`/employees?page=1&limit=25...`). No large dataset slicing occurs on the client.
2. **Dual-Currency Invariance**: Every monetary figure retains both native employee contract values and normalized organizational reporting values (`salary_usd`).
3. **URL State Synchronization**: State is preserved across reloads and shared sessions by keeping table parameters in URL search query strings (`useSearchParams` / `useRouter`).
4. **Optimistic Updates & Resilience**: Mutating operations update the UI immediately with optimistic cache updates and roll back cleanly with error toasts if the server rejects the operation.
5. **Strict Schema Parity**: Frontend Zod schemas mirror backend Pydantic models to catch invalid payloads before network requests are dispatched.

