# Project Overview: ACME Global Salary Management

## Overview
ACME Global Salary Management is a centralized, high-performance web-based platform designed for ACME's HR team to manage compensation records for 10,000+ global employees across multiple international offices (US, UK, Germany, Canada, Nigeria, etc.). Replacing fragile spreadsheets, the platform provides instant analytical insights into organizational compensation ("How ACME Pays"), robust server-side paginated data browsing, dual-currency visualization, CRUD workflows with salary diff comparisons, batch CSV ingestion, and compensation audit history.

## Goals
1. **Centralized Compensation Hub**: Consolidate global employee compensation data into a single, validated relational store.
2. **High-Performance Exploration**: Deliver sub-second (<200ms) search, faceted filtering, multi-column sorting, and pagination across 10,000+ employee records.
3. **Actionable Analytics ("How ACME Pays")**: Provide real-time KPI metrics (total payroll, average, median, currency split) and interactive department/geographic charts.
4. **Reliable Workflows**: Offer intuitive employee management (Add/Edit with salary diff preview, CSV drag-and-drop ingestion with preview, soft-delete confirmation, and salary change history slide-over drawer).

## User Persona
- **Target Persona**: Strictly the **HR Manager**.
- **Use Case**: Managing global compensation, analyzing payroll distributions, performing salary reviews, importing spreadsheet updates, and ensuring pay equity across departments and countries.

---

## Core User Flows

1. **Dashboard & Analytics Exploration**:
   - HR Manager views top-level summary cards (Total Payroll, Avg Salary, Median Salary, Active Headcount).
   - Toggles global currency normalization (USD, EUR, GBP) to recalculate all figures.
   - Inspects departmental spend (horizontal bar chart) and geographic compensation distributions (donut/bar chart).

2. **Employee Directory & Filtering**:
   - Browses the high-density employee table with server-side pagination (10, 25, 50, 100 per page).
   - Searches in real-time by employee name, title, or email (300ms debounced).
   - Applies faceted filters (Department, Country, Employment Type, Status).
   - Observes dual-currency compensation (local native currency + normalized USD equivalent).
   - Exports filtered views directly via streaming CSV download.

3. **Employee Lifecycle & Compensation Management**:
   - **Add Employee**: Opens modal, enters employee details, validates via Zod schema, and saves.
   - **Edit Employee**: Modifies salary/role and inspects the live **Salary Diff Preview** (e.g., "$120,000 → $135,000 (+12.5%)") before saving.
   - **View History**: Slides open the right-side **Salary History Drawer** to review past compensation adjustments and effective dates.
   - **Soft Delete**: Triggers destructive alert dialog with optimistic removal and error rollback.

4. **Batch CSV Ingestion**:
   - Opens bulk import modal, drags and drops `.csv` / `.xlsx` file.
   - Reviews in-browser validation table preview (first 5 rows with green/red row flags).
   - Dispatches batch import to the backend.

---

## Features

### 1. Global Header & Control Bar
- Product branding: `"ACME Compensation"` with `"Global Payroll Sync • Active"` status badge.
- Global Currency Normalization Selector: Segmented toggle / dropdown between `USD ($)`, `EUR (€)`, and `GBP (£)`.
- Batch actions: `"Import CSV"` button and primary `"+ Add Employee"` CTA.

### 2. Compensation Analytics ("How ACME Pays")
- **KPI Metrics Strip**:
  - Total Annual Payroll (USD normalized aggregated with MoM trend).
  - Average Base Salary & Median Salary.
  - Active Headcount & Currency Breakdown badges (USD, EUR, GBP, CAD, etc.).
- **Analytical Visualizations (Recharts)**:
  - Departmental Breakdown: Horizontal bar chart comparing total payroll expenditure and average salary across departments (Engineering, Sales, Product, Marketing, Operations, HR).
  - Geographic Spend Distribution: Grouped bar or donut chart comparing headcount and total spend across operating countries.

### 3. Server-Driven Employee Data Grid
- **Toolbar**: Debounced search input, multi-select faceted filters (Department, Country, Employment Type, Status), CSV Export trigger.
- **High-Density Table**:
  - Employee Name & Email (stacked sub-text).
  - Job Title & Department pill.
  - Country flag/code & City.
  - Employment Type & Status badge (Active: green, On Leave: amber, Terminated: neutral).
  - Local Compensation: Native Base Salary & Bonus (e.g., `£75,000 + £5,000`).
  - Normalized Salary: Standardized USD total (e.g., `$98,250 USD`).
  - Sticky Actions Menu: Edit, View History, Soft Delete.
- **Server Pagination**: Page selector, rows-per-page dropdown, total record counter synced to URL search parameters.

### 4. Interactive Modals & Workflow Overlays
- **Add / Edit Employee Modal**: 2-column form with Zod validation and Salary Diff comparison card.
- **Batch CSV Ingestion Modal**: Drag-and-drop uploader with 5-row schema validation preview.
- **Salary History Slide-over Sheet**: Audit timeline of historical adjustments, effective dates, and change notes.
- **Soft-Delete Alert Dialog**: Destructive confirmation with optimistic UI update and Sonner toast rollback.

---

## Scope Boundaries

### In Scope
- Single-page HR management dashboard with analytics and high-density data grid.
- TanStack Query server state management, caching, and optimistic mutations.
- URL search parameter synchronization for filters, pagination, and sorting.
- Form validation with React Hook Form + Zod matching backend Pydantic models.
- Recharts visualizations for departmental and country distributions.
- Vitest unit tests and MSW integration tests for tables, forms, and optimistic updates.

### Deliberately Out of Scope (Trade-offs & Justification)
| Out-of-Scope Feature | Reasoning / Justification |
| -------------------- | ------------------------- |
| **Complex Multi-Tier RBAC** | The target persona is strictly the HR Manager. Complex role hierarchies (employee self-service, line-manager approvals) add unnecessary authorization bloat for the core MVP. |
| **Automated Payroll Execution & Banking** | The platform is a salary management and intelligence platform, not a direct payment gateway or tax-filing processor. |
| **Temporal Event-Sourcing / Complex Versioned Tables** | Storing discrete salary adjustment logs in a salary history drawer fulfills audit requirements without complex event-sourcing infrastructure. |
| **Live External Forex Conversion APIs** | Real-time exchange rate APIs introduce external network latency and rate limits. The system stores standardized base-currency equivalents alongside native currency. |

---

## Success Criteria & Performance Targets
1. **Response Times**: Server-side pagination, search, and analytics queries return in `<200ms` over 10,000 records.
2. **Data Integrity**: Full Zod schema validation matching backend Pydantic models; dual currency display for all monetary items.
3. **UI Fidelity**: High-density, restrained enterprise design matching the ACME Global design specification (Dark/Light modes).
4. **Test Coverage**: Fast, deterministic unit tests (Zod schemas, edge cases) and integration tests (MSW mocked API endpoints).
