'use client';

import { Suspense, useMemo } from 'react';
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
import type { Employee, EmployeeFilterParams, EmployeeStatus, EmploymentType } from '@/lib/types';
import { toast } from 'sonner';

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currency } = useCurrency();

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
  const { data: summary, isLoading: isSummaryLoading } = useAnalyticsSummary(currency);
  const { data: departments, isLoading: isDeptsLoading } = useDepartmentAnalytics(currency);
  const { data: countries, isLoading: isCountriesLoading } = useCountryAnalytics(currency);

  // Fetch server-driven paginated employees matching active filters
  const { data: employeeData, isLoading: isEmployeesLoading } = useEmployees(filterParams);

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
    toast.info('Add Employee modal will be connected in Phase 2 Step 3');
  };

  const handleImportCsv = () => {
    toast.info('CSV Import modal will be connected in Phase 2 Step 3');
  };

  const handleEditEmployee = (emp: Employee) => {
    toast.info(`Editing ${emp.name} (Modal will be connected in Phase 2 Step 3)`);
  };

  const handleViewHistory = (emp: Employee) => {
    toast.info(`Viewing salary history for ${emp.name} (Slide-over will be connected in Phase 2 Step 3)`);
  };

  const handleDeleteEmployee = (emp: Employee) => {
    toast.info(`Delete confirmation for ${emp.name} (Dialog will be connected in Phase 2 Step 3)`);
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
          />

          {/* Analytical Visualizations Row (Departmental & Geographic) */}
          <CompensationCharts
            departments={departments}
            countries={countries}
            currency={currency}
            isLoading={isDeptsLoading || isCountriesLoading}
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
            filters={filterParams}
            onFilterChange={handleFilterChange}
            onEditEmployee={handleEditEmployee}
            onViewHistory={handleViewHistory}
            onDeleteEmployee={handleDeleteEmployee}
          />
        </section>
      </main>
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
