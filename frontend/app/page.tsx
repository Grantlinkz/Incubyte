'use client';

import { Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GlobalHeader } from '@/components/layout/global-header';
import { useCurrency } from '@/hooks/use-currency';
import {
  useAnalyticsSummary,
  useCountryAnalytics,
  useDepartmentAnalytics,
} from '@/hooks/use-analytics';
import { useEmployees } from '@/hooks/use-employees';
import { KpiMetricsStrip } from '@/components/dashboard/kpi-metrics-strip';
import { CompensationCharts } from '@/components/dashboard/compensation-charts';
import { TableToolbar } from '@/components/employees/table-toolbar';
import { EmployeeDataTable } from '@/components/employees/employee-data-table';
import { EmployeeModal } from '@/components/employees/employee-modal';
import { DeleteDialog } from '@/components/employees/delete-dialog';
import { SalaryHistorySheet } from '@/components/employees/salary-history-sheet';
import { CsvImportModal } from '@/components/employees/csv-import-modal';
import type { Employee, EmployeeFilterParams, EmployeeStatus, EmploymentType } from '@/lib/types';
import { toast } from 'sonner';

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currency } = useCurrency();

  // Modal & Overlay State Management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [historyEmployee, setHistoryEmployee] = useState<Employee | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Parse table filter params from URL search parameters
  const filterParams: EmployeeFilterParams = useMemo(() => {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 25;
    const search = searchParams.get('search') || undefined;
    const departmentRaw = searchParams.get('department');
    const countryRaw = searchParams.get('country');
    const typeRaw = searchParams.get('employment_type');
    const statusRaw = searchParams.get('status');
    const sort_by = searchParams.get('sort_by') || undefined;
    const sort_order = (searchParams.get('sort_order') as 'asc' | 'desc') || undefined;

    return {
      page,
      limit,
      search,
      department: departmentRaw ? departmentRaw.split(',') : undefined,
      country: countryRaw ? countryRaw.split(',') : undefined,
      employment_type: typeRaw ? (typeRaw.split(',') as EmploymentType[]) : undefined,
      status: statusRaw ? (statusRaw.split(',') as EmployeeStatus[]) : undefined,
      sort_by,
      sort_order,
    };
  }, [searchParams]);

  // Fetch real-time / normalized analytics data for selected base currency
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useAnalyticsSummary(currency);

  const {
    data: departments,
    isLoading: isDeptsLoading,
    isError: isDeptsError,
    refetch: refetchDepts,
  } = useDepartmentAnalytics(currency);

  const {
    data: countries,
    isLoading: isCountriesLoading,
    isError: isCountriesError,
    refetch: refetchCountries,
  } = useCountryAnalytics(currency);

  // Fetch server-driven paginated employees matching active filters
  const {
    data: employeeData,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    refetch: refetchEmployees,
  } = useEmployees(filterParams);

  // Bidirectional URL search param updater
  const handleFilterChange = (newFilters: Partial<EmployeeFilterParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, val]) => {
      if (
        val === undefined ||
        val === null ||
        val === '' ||
        (Array.isArray(val) && val.length === 0)
      ) {
        params.delete(key);
      } else if (Array.isArray(val)) {
        params.set(key, val.join(','));
      } else {
        params.set(key, String(val));
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    const curr = searchParams.get('currency');
    if (curr) params.set('currency', curr);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    toast.info('Filters reset to default view');
  };

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleImportCsv = () => {
    setIsCsvModalOpen(true);
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
  };

  const handleViewHistory = (emp: Employee) => {
    setHistoryEmployee(emp);
  };

  const handleDeleteEmployee = (emp: Employee) => {
    setDeletingEmployee(emp);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* 1. Global Header Bar */}
      <GlobalHeader
        onAddEmployee={handleAddEmployee}
        onImportCsv={handleImportCsv}
      />

      {/* 2. Main Dashboard Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Section 1: How ACME Pays (Analytics) */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground m-0">
                How ACME Pays
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Global compensation breakdown, macro payroll KPIs, and geographic distribution metrics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-sm bg-secondary px-2.5 py-1 text-xs font-mono font-medium text-secondary-foreground border border-border">
                Base Currency: <strong className="ml-1 text-primary">{currency}</strong>
              </span>
            </div>
          </div>

          {/* Top Section KPI Metrics Strip */}
          <KpiMetricsStrip
            summary={summary}
            currency={currency}
            isLoading={isSummaryLoading}
            isError={isSummaryError}
            onRetry={() => refetchSummary()}
          />

          {/* Analytical Visualizations Row (Departmental & Geographic) */}
          <CompensationCharts
            departments={departments}
            countries={countries}
            currency={currency}
            isLoading={isDeptsLoading || isCountriesLoading}
            isError={isDeptsError || isCountriesError}
            onRetry={() => {
              refetchDepts();
              refetchCountries();
            }}
          />
        </section>

        {/* Section 2: Employee Roster (Data Grid) */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground m-0">
                Employee Roster
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Manage and review global compensation data for all active personnel across offices.
              </p>
            </div>
          </div>

          {/* Table Toolbar */}
          <TableToolbar
            filters={filterParams}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalRecords={employeeData?.total || 0}
            isLoading={isEmployeesLoading}
          />

          {/* Server-Driven Data Table */}
          <EmployeeDataTable
            data={employeeData}
            isLoading={isEmployeesLoading}
            isError={isEmployeesError}
            onRetry={() => refetchEmployees()}
            filters={filterParams}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onEditEmployee={handleEditEmployee}
            onViewHistory={handleViewHistory}
            onDeleteEmployee={handleDeleteEmployee}
          />
        </section>
      </main>

      {/* 3. Interactive Modals & Workflow Overlays */}
      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Employee Modal */}
      <EmployeeModal
        isOpen={!!editingEmployee}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={!!deletingEmployee}
        employee={deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
      />

      {/* Salary History Slide-Over Drawer */}
      <SalaryHistorySheet
        isOpen={!!historyEmployee}
        employee={historyEmployee}
        onClose={() => setHistoryEmployee(null)}
      />

      {/* Batch CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading ACME Global Compensation...
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

