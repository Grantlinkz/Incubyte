# Implementation Plan: Phase 3 — Verification, Automated Tests & Build Check

## Goal & Scope
Implement Phase 3 for ACME Global Salary Management to deliver a comprehensive, deterministic test suite and end-to-end verification covering:
1. **Vitest & MSW Test Environment Setup**:
   - Configure `vitest.config.ts` with JSDOM environment, path alias resolution (`@/*`), and global test setups.
   - Configure `vitest.setup.ts` with `@testing-library/jest-dom/vitest`, `ResizeObserver`, `matchMedia`, and MSW server lifecycle.
   - Update `package.json` with `test` and `test:watch` scripts.
2. **Unit Tests (Zod Validations & Salary Math)**:
   - `__tests__/validations/employee-validation.test.ts`: Validate `employeeSchema`, `employeeFilterSchema`, and `csvRowSchema` against edge-case numeric inputs (negative numbers, empty strings, invalid currency codes, valid ISO codes, bonus constraints).
   - `__tests__/utils/salary-calculations.test.ts`: Validate dual-currency conversions, salary diff math, percentage changes, and number formatting.
3. **Component & Integration Tests with MSW**:
   - `__tests__/components/employee-table.test.tsx`: Test server-driven table rendering, pagination controls, sorting contract alignment (`base_salary`, `salary_usd`), and empty state display.
   - `__tests__/components/employee-form.test.tsx`: Test employee add/edit modal with react-hook-form + Zod validation, dynamic salary diff preview card rendering, and form submission.
   - `__tests__/integration/optimistic-mutations.test.tsx`: Test TanStack Query optimistic mutations and error rollback behaviors when backend returns 500 errors.
4. **Verification & Build Validation**:
   - Run Vitest suite (`npm run test`) to ensure all tests pass deterministically.
   - Run `npm run lint` and `npm run build` to verify production readiness.

---

## Inspected Code & Reference Artifacts
- Assessment Specifications:
  - `assesesment details/Frontend Implementation Plan.pdf` (Step 5: Frontend Testing & Deterministic Verification)
  - `assesesment details/Product Requirements Document.pdf`
  - `assesesment details/Salary Management Assessment.pdf`
- Master Spec & Tracker:
  - `context/AGENTS.md`
  - `context/code-standards.md`
  - `context/progress-tracker.md`
- Source Code to Test:
  - `lib/validations/employee.ts`
  - `lib/utils.ts`
  - `hooks/use-employees.ts`
  - `hooks/use-analytics.ts`
  - `components/employees/employee-modal.tsx`
  - `components/employees/employee-data-table.tsx`
  - `components/dashboard/kpi-metrics-strip.tsx`

---

## Architectural Decisions & Assumptions
1. **Deterministic Test Environment**: Use MSW (Mock Service Worker) v2 to intercept REST endpoints (`/api/employees`, `/api/analytics/*`) with predictable payloads.
2. **JSDOM Polyfills**: Provide standard mock polyfills for `ResizeObserver` and `window.matchMedia` to support Recharts and Radix UI dialogs/selects in headless test runners.
3. **Strict Type & Schema Compliance**: Direct verification against Zod schemas ensures complete alignment with FastAPI backend Pydantic expectations.

---

## Files to Modify & Create

### 1. New Configuration & Test Setup Files
- [NEW] `vitest.config.ts`: Vitest configuration with React plugin, path aliases, and JSDOM setup.
- [NEW] `vitest.setup.ts`: Test setup file with MSW server hooks, `@testing-library/jest-dom`, and browser API mocks.

### 2. New Test Suites
- [NEW] `__tests__/validations/employee-validation.test.ts`: Zod schema validation rules and edge cases.
- [NEW] `__tests__/utils/salary-calculations.test.ts`: Currency conversion, formatting, and diff calculation tests.
- [NEW] `__tests__/components/employee-table.test.tsx`: Table rendering, pagination, and sorting integration test.
- [NEW] `__tests__/components/employee-form.test.tsx`: Form validation, salary diff card, and submission test.
- [NEW] `__tests__/integration/optimistic-mutations.test.tsx`: TanStack Query optimistic update and rollback test.

### 3. Modified Files
- [MODIFY] `package.json`: Add `"test": "vitest run"` and `"test:watch": "vitest"`.
- [MODIFY] `context/progress-tracker.md`: Mark Phase 3 complete with test verification logs.

---

## Acceptance Criteria & Verification Checks
- [ ] All Vitest test suites execute and pass with 0 failures.
- [ ] Zod schema tests verify negative numbers, missing fields, invalid email, and invalid currency codes.
- [ ] Salary calculations correctly evaluate positive/negative adjustments and multi-currency conversions.
- [ ] Form and Table component tests successfully render and interact with MSW mocked API endpoints.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npm run build` generates a successful production bundle.

---

## Manual Test Steps
1. Execute `npm run test` -> Verify all test suites pass.
2. Execute `npm run build` -> Verify Next.js production build succeeds with clean output.
