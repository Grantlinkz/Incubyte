# UI Context: ACME Global Compensation Dashboard

## Brand & Visual Theme
The design system for **ACME Global** delivers a quiet, restrained enterprise aesthetic tailored for high-stakes HR compensation management. Inspired by modern developer tools (e.g., Linear, shadcn/ui), it emphasizes high information density, sharp lines, structural dividers, and crisp typography over decorative flourishes.

The application supports both a high-contrast **Dark Mode** ("Quiet Authority" / Midnight Slate) and a crisp **Light Mode** ("Clean Document" / Modern Corporate).

---

## Color Tokens & Design System

All components must strictly use CSS variables and Tailwind utility tokens — no arbitrary hardcoded hex codes.

### Dark Mode Theme Tokens (`acme_global_1`)
| Role | Token / CSS Variable | Hex Value | Usage |
| ---- | -------------------- | --------- | ----- |
| **Base Background** | `--bg-base` / `background` | `#051424` / `#0f172a` | Deep canvas background |
| **Surface (Level 1)** | `--bg-surface` / `surface-container` | `#1e293b` (Slate-900) | Metric cards, table containers, sidebars |
| **Surface Elevated (Level 2)** | `--bg-surface-elevated` | `#334155` (Slate-800) | Modals, slide-overs, popovers, table headers |
| **Primary Text** | `--text-primary` / `on-surface` | `#f8fafc` (Slate-50) | High-contrast body, names, headers |
| **Muted Text** | `--text-muted` / `on-surface-variant` | `#94a3b8` (Slate-400) | Secondary metadata, labels, table sub-text |
| **Primary Accent / CTA** | `--accent-primary` / `secondary` | `#3b82f6` / `#bec6e0` | Progression actions, active links |
| **Default Border** | `--border-default` / `outline` | `#334155` (Slate-700) | 1px clean container dividers |
| **Success State** | `--state-success` / `tertiary` | `#10b981` / `#4edea3` | Active status badge, positive diffs |
| **Warning State** | `--state-warning` | `#f59e0b` | "On Leave" status badge |
| **Error / Destructive** | `--state-error` / `error` | `#ef4444` / `#ffb4ab` | Destructive modal buttons, delete actions |

### Light Mode Theme Tokens (`acme_global_2`)
| Role | Token / CSS Variable | Hex Value | Usage |
| ---- | -------------------- | --------- | ----- |
| **Base Background** | `--bg-base` / `background` | `#f8f9ff` / `#f8fafc` | Clean light canvas |
| **Surface (Level 1)** | `--bg-surface` | `#ffffff` | Pure white cards and table background |
| **Surface Muted** | `--bg-surface-muted` | `#f1f5f9` (Slate-100) | Table headers, segmented control tracks |
| **Primary Text** | `--text-primary` | `#0f172a` (Slate-900) | Authoritative text and titles |
| **Muted Text** | `--text-muted` | `#64748b` (Slate-500) | Metadata, table headers, subtitles |
| **Primary Action** | `--action-primary` | `#0f172a` (Dark Slate) | Primary black buttons with white text |
| **Accent / CTA** | `--accent-primary` | `#2563eb` (Blue-600) | Primary links, CTAs, focus rings |
| **Default Border** | `--border-default` | `#e2e8f0` (Slate-200) | 1px container and table borders |

---

## Typography Hierarchy (Inter)

Powered by **Inter** with compact enterprise leading and structured letter spacing:

| Level | Size | Weight | Line Height | Letter Spacing | Context |
| ----- | ---- | ------ | ----------- | -------------- | ------- |
| **Display** | 36px (`text-4xl`) | Bold (700) | 40px | `-0.02em` | KPI primary currency metrics |
| **Headline Large** | 24px (`text-2xl`) | Semi-Bold (600) | 32px | `-0.015em` | Page header ("ACME Compensation") |
| **Headline Medium** | 20px (`text-xl`) | Semi-Bold (600) | 28px | `-0.01em` | Section headers ("How ACME Pays") |
| **Body Large** | 16px (`text-base`) | Regular (400) | 24px | `0` | Dialog body text, prominent descriptions |
| **Body Medium** | 14px (`text-sm`) | Regular (400) | 20px | `0` | **Workhorse size**: Employee table rows, form inputs |
| **Body Small** | 13px (`text-xs+`) | Regular (400) | 18px | `0` | Secondary table subtext (email, details) |
| **Label Medium** | 12px (`text-xs`) | Medium (500) | 16px | `+0.05em` | Form labels, table header titles (uppercase) |
| **Label Small** | 11px | Semi-Bold (600) | 14px | `+0.05em` | Status badges, compact currency pills |

---

## Border Radius & Elevation

- **Standard (4px / `rounded` / `rounded-sm`)**: Action buttons, input fields, tags, filter dropdown triggers.
- **Large (8px / `rounded-lg`)**: Metric cards, chart containers, table outer wrapper.
- **Extra Large (12px / `rounded-xl`)**: Global modals (Add/Edit, CSV Ingest) and slide-over drawers.
- **Full Pill (`rounded-full`)**: Applied strictly to status indicators (e.g., "Active", "On Leave", "Terminated") to avoid confusion with interactive buttons.
- **Elevation**: Tonal layering with 1px borders rather than heavy drop shadows.

---

## Screen Sections & Component Specifications

### 1. Global Header & Control Bar
- **Left Side**: "ACME Compensation" title with `"Global Payroll Sync • Active"` live badge.
- **Right Side**:
  - Global Currency Selector toggle (`USD ($)`, `EUR (€)`, `GBP (£)`).
  - Secondary Action Button: `"Import CSV"` with spreadsheet upload icon.
  - Primary CTA: `"+ Add Employee"` button.

### 2. Top Section: Compensation Analytics ("How ACME Pays")
- **KPI Metrics Strip (4 Stat Cards)**:
  1. *Total Annual Payroll*: Prominent currency sum with subtle MoM trend indicator.
  2. *Average Base Salary*: Mean compensation in active normalized currency.
  3. *Median Salary*: Midpoint compensation benchmark.
  4. *Active Headcount & Currencies*: Total employee count with badge pills for active currencies.
- **Analytical Visualizations (2 Side-by-Side Cards)**:
  1. *Departmental Breakdown (Horizontal Bar Chart)*: Total spend and average salary across Engineering, Sales, Product, Marketing, Operations, HR.
  2. *Geographic Spend Distribution (Grouped Bar / Donut Chart)*: Spend and headcount distribution across US, UK, Germany, Canada, Nigeria, etc.

### 3. Bottom Section: Server-Driven Employee Data Grid
- **Toolbar**:
  - Search Input: Debounced (300ms) with placeholder `"Search by employee name, title, or email..."`.
  - Faceted Multi-Selects: Department, Country, Employment Type (Full-time, Part-time, Contractor), Status (Active, On Leave, Terminated).
  - Actions: `"Export CSV"` button.
- **High-Density Table**:
  - Row height: Fixed 48px. Monospace formatting for salary numbers.
  - Columns: Employee (Name & Email), Title & Dept, Country & City, Status Badge, Native Compensation (`£75,000 + £5,000`), Normalized USD (`$98,250 USD`), Sticky Actions (`...` dropdown).
- **Pagination Footer**:
  - Left: `"Showing 1–25 of 10,000 records"`.
  - Right: Page size selector (`10`, `25`, `50`, `100`) + numbered page navigation (`< 1 2 3 ... 400 >`).

### 4. Interactive Modals & Workflow Overlays
- **Add / Edit Employee Modal (`employee-modal.tsx`)**:
  - 2-column input layout with full field validation.
  - **Salary Diff Comparison Card**: Displays `"Current: $120,000 → Proposed: $135,000 (+12.5%)"` during edits.
- **Batch CSV Ingestion Modal (`csv-import-modal.tsx`)**:
  - Drag-and-drop zone accepting `.csv` and `.xlsx`.
  - In-browser 5-row preview table highlighting valid rows (green) and errors (red).
- **Salary History Slide-over Sheet (`salary-history-sheet.tsx`)**:
  - Sliding right drawer with timeline of past compensation adjustments, dates, and audit notes.
- **Soft-Delete Dialog (`delete-dialog.tsx`)**:
  - Destructive confirmation alert with Sonner toast feedback and cache rollback.

---

## Icons
- Powered by **Lucide React** (stroke-based icons).
- Standard sizes: `h-4 w-4` for table actions and inline badges; `h-5 w-5` for toolbar and modal buttons.
