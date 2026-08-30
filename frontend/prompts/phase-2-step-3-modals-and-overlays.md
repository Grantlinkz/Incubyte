# Implementation Plan: Phase 2 Step 3 — Interactive Modals & Workflow Overlays

## Goal & Scope
Implement Phase 2 Step 3 for ACME Global Salary Management by delivering interactive modal dialogs and slide-over overlays adhering strictly to the UI mockups and specifications:
1. **Employee Modal (`components/employees/employee-modal.tsx`)**: Modal supporting both "Add Employee" and "Edit Employee" with a two-column layout (Personal & Role, Compensation Details), real-time salary diff comparison card, and React Hook Form + Zod validation.
2. **Delete Confirmation Dialog (`components/employees/delete-dialog.tsx`)**: High-contrast destructive confirmation dialog with employee summary avatar/card, warning copy, and delete mutation trigger.
3. **Salary History Slide-Over Sheet (`components/employees/salary-history-sheet.tsx`)**: Right-side drawer showcasing employee compensation history timeline, percentage changes, revision reasons, and export capabilities.
4. **Batch CSV Import Modal (`components/employees/csv-import-modal.tsx`)**: Drag-and-drop CSV ingestion with client-side Zod validation, error summary, table preview of valid/invalid rows, and bulk commit mutation.
5. **Mutation Hooks & Query Sync (`hooks/use-employees.ts`)**: Add `useSalaryHistory` and `useBulkImportEmployees` hooks with automatic invalidation of employee data grid and analytics queries.
6. **Main Page Integration (`app/page.tsx`)**: Wire all action handlers (`handleAddEmployee`, `handleEditEmployee`, `handleViewHistory`, `handleDeleteEmployee`, `handleImportCsv`) to modal state management.

---

## Inspected Code & Reference Artifacts
- Master Spec: `context/AGENTS.md` and `context/progress-tracker.md`
- UI Mockups:
  - `assesesment details/acme ui/6 acme_global_edit_employee_modal/code.html` (Dark & Light)
  - `assesesment details/acme ui/7 acme_global_delete_confirmation_dialog/code.html` (Dark & Light)
  - `assesesment details/acme ui/5 acme_global_salary_history_slide_over/code.html` (Dark & Light)
  - `assesesment details/acme ui/4 acme_global_batch_csv_import_dialog/code.html` (Dark & Light)
- Types & Validation: `lib/types.ts`, `lib/validations/employee.ts`, `lib/mock-data.ts`, `lib/utils.ts`
- Primitives: `components/ui/dialog.tsx`, `components/ui/button.tsx`, `components/ui/input.tsx`

---

## Architectural Decisions & Invariants
1. **Unified Add/Edit Form Logic**: Single `EmployeeModal` component parameterized by `employee?: Employee | null` with automated prefill, reactive salary diff calculations, and dynamic titles.
2. **Real-Time Salary Diff**: Compute net change (`+$15,000 (+12.5%)`) in real-time as the user edits Base Salary compared to the initial salary.
3. **Client-Side CSV Parsing & Validation**: Parse uploaded CSV text without external heavyweight dependencies, validate each row using `csvRowSchema`, categorize rows into `valid` and `invalid`, and display an informative preview table with clear issue indicators.
4. **Audit Trail Synchronization**: Updating an employee's salary generates an audit entry in the salary history log so the slide-over reflects changes immediately.
5. **Cache Invalidation**: On successful mutation (create, edit, delete, bulk import), trigger React Query cache invalidation for both `['employees']` and `['analytics']` to keep KPIs, charts, and table rows in sync.

---

## Files to Modify & Create

### 1. New Components
- [NEW] `components/employees/employee-modal.tsx`: Add/Edit employee dialog with salary diff card.
- [NEW] `components/employees/delete-dialog.tsx`: Destructive delete confirmation dialog.
- [NEW] `components/employees/salary-history-sheet.tsx`: Slide-over drawer for compensation audit timeline.
- [NEW] `components/employees/csv-import-modal.tsx`: Batch CSV upload, validation, and preview modal.

### 2. Modified Files
- [MODIFY] `hooks/use-employees.ts`: Add `useSalaryHistory` and `useBulkImportEmployees` hooks.
- [MODIFY] `lib/mock-data.ts`: Add `bulkImportMockEmployees` helper and update salary history cache upon employee update.
- [MODIFY] `app/page.tsx`: Connect state and event listeners to all 4 modals/overlays.
- [MODIFY] `context/progress-tracker.md`: Mark Phase 2 Step 3 completed.

---

## Acceptance Criteria & Verification Checks
- [ ] Clicking **"Add Employee"** opens the modal with empty fields; submitting creates a new employee and refreshes table + KPI metrics.
- [ ] Clicking **"Edit"** on a table row opens the modal prefilled with that employee's data; editing base salary shows the live green/red diff card; saving updates the employee.
- [ ] Clicking **"Delete"** on a table row opens the delete confirmation dialog; confirming removes the record with Sonner toast feedback and updates table/analytics.
- [ ] Clicking **"History"** on a table row opens the right slide-over with the employee's compensation history timeline.
- [ ] Clicking **"Quick Batch Import"** or **"Import CSV"** opens the CSV import modal with drag-and-drop file upload, row validation preview, and bulk import action.
- [ ] `npm run lint` and `npm run build` pass with zero errors.

---

## Manual Test Steps
1. Navigate to dashboard (`/`).
2. Click **"Add Employee"** -> Fill in test data -> Submit -> Verify new row in table and updated KPI count.
3. Click **Edit** icon on an employee -> Change salary from $120,000 to $135,000 -> Verify diff badge shows `+$15,000 (+12.5%)` -> Save changes.
4. Click **History** icon on the employee -> Verify salary history timeline shows recent adjustments.
5. Click **Delete** icon -> Confirm delete -> Verify row removed.
6. Click **"Import CSV"** -> Upload CSV -> Verify preview table shows valid/error rows -> Click Import -> Verify imported rows appear in table.
