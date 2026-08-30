# Implementation Prompt: Phase 1 — API Client, Data Validation Layer & Global Header Control Bar

## 1. Goal & Scope
Establish the foundational infrastructure and the top-level navigation shell for **ACME Global Salary Management** according to the project specifications:
1. **API Client & Type Layer**: Configure typed Axios client (`lib/api-client.ts`), Zod validation schemas (`lib/validations/employee.ts`), shared TypeScript interfaces (`lib/types.ts`), and utility helpers (`lib/utils.ts` for currency formatting, locale-aware math, diff calculations).
2. **Mock Server & Development Provider**: Configure mock dataset and MSW/mock API handlers (`lib/mock-data.ts`) to enable instant, deterministic frontend execution and testing for 10,000+ records.
3. **Application Providers & Theme Setup**: Integrate TanStack Query Client Provider, `next-themes` ThemeProvider (Dark/Light modes conforming to `acme_global_1` & `acme_global_2`), and Sonner Toaster in `app/layout.tsx` / `app/providers.tsx`.
4. **Global Header & Control Bar**: Implement high-fidelity `components/layout/global-header.tsx` matching the reference UI in `1acme_compensation_header_control_bar` and `1acme_compensation_header_dark_mode`:
   - "ACME Compensation" branding.
   - "Global Payroll Sync • Active" live status badge.
   - Base Currency selector (`USD`, `EUR`, `GBP`) with URL state synchronization.
   - Dark / Light mode toggle.
   - "Import CSV" secondary action button with upload icon.
   - "+ Add Employee" primary CTA button with plus icon.

---

## 2. Inspected Specifications & Assets
- Master Spec: `context/AGENTS.md`
- UI Design Tokens & Context: `context/ui-context.md`, `assesesment details/acme ui/1acme_compensation_header_control_bar/code.html`, and `assesesment details/acme ui/1acme_compensation_header_dark_mode/code.html`
- Architecture & Contracts: `context/architecture.md`, `context/code-standards.md`
- Assessment Requirements: `assesesment details/Frontend Implementation Plan.pdf`, `Product Requirements Document.pdf`, `Salary Management Assessment.pdf`

---

## 3. Architectural Decisions & Invariants
1. **Strict TypeScript & Zod Contracts**: All data structures strictly match backend FastAPI models (`snake_case` keys: `base_salary`, `salary_usd`, `employment_type`, etc.).
2. **Dual Theme Tokens**: Tailwind CSS v4 variables aligned with slate palettes for dark (`#0f172a`, `#1e293b`, `#334155`) and light (`#f8f9ff`, `#ffffff`, `#e2e8f0`) modes.
3. **URL State Synchronization**: Currency selection (`USD`, `EUR`, `GBP`) seamlessly reflects in and reads from the URL search parameters (`?currency=USD`).
4. **Decoupled State**: TanStack Query manages server caching and query keys.

---

## 4. Files to Create or Modify

### New Files
- `lib/types.ts`: Core domain types (Employee, Compensation, SalaryHistory, AnalyticsSummary, DepartmentAnalytics, CountryAnalytics, FilterParams).
- `lib/validations/employee.ts`: Zod schemas for employee validation, salary adjustment calculations, and CSV row validation.
- `lib/api-client.ts`: Axios client instance configured with FastAPI endpoints and error handling.
- `lib/mock-data.ts`: Deterministic mock dataset generator with realistic international employee records across US, UK, Germany, Canada, Nigeria, etc.
- `hooks/use-currency.ts`: Custom hook for active base currency state synchronized with URL search params.
- `app/providers.tsx`: React Query Client + ThemeProvider + Sonner Toaster wrapper.
- `components/layout/global-header.tsx`: Enterprise header & control bar matching the design assets.
- `components/layout/theme-toggle.tsx`: Seamless dark/light theme switch button.

### Modified Files
- `app/globals.css`: Enhanced theme color variables and design tokens for high-density enterprise UI.
- `app/layout.tsx`: Provider integration and global font setup.
- `app/page.tsx`: Dashboard container hosting the Global Header and main layout shell.
- `lib/utils.ts`: Extended with currency formatters (`formatCurrency`, `formatDiffPercentage`, `calculateSalaryDiff`).
- `context/progress-tracker.md`: Documentation update for Phase 1 completion.

---

## 5. Acceptance Criteria & Verification Checks
- [ ] TypeScript strict compilation succeeds with zero `any` types.
- [ ] Global header matches pixel-fidelity, typography (Inter), padding, and color tokens of both dark and light reference designs.
- [ ] Switching between USD, EUR, and GBP dynamically updates active URL search parameters (`?currency=EUR`).
- [ ] Theme toggle smoothly switches between Dark Mode (`acme_global_1`) and Light Mode (`acme_global_2`).
- [ ] Base Axios client and Zod validation schemas successfully validate employee payloads.
- [ ] `npm run lint` and `npm run build` pass without errors.

---

## 6. Manual Verification Steps
1. Run `npm run dev` and open `http://localhost:3000`.
2. Inspect the Global Header:
   - Check title and "Global Payroll Sync • Active" status indicator.
   - Change currency from USD to EUR/GBP; observe URL parameter update.
   - Click Theme toggle to switch between dark and light themes; verify background, surface, text, and border contrast.
   - Click "Import CSV" and "Add Employee" buttons (verify hover states and trigger hooks).
