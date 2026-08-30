'use client';

import { Suspense } from 'react';
import { GlobalHeader } from '@/components/layout/global-header';
import { useCurrency } from '@/hooks/use-currency';
import {
  useAnalyticsSummary,
  useCountryAnalytics,
  useDepartmentAnalytics,
} from '@/hooks/use-analytics';
import { KpiMetricsStrip } from '@/components/dashboard/kpi-metrics-strip';
import { CompensationCharts } from '@/components/dashboard/compensation-charts';
import { toast } from 'sonner';
import { Users2 } from 'lucide-react';

function DashboardContent() {
  const { currency } = useCurrency();

  // Fetch real-time / normalized analytics data for selected base currency
  const { data: summary, isLoading: isSummaryLoading } = useAnalyticsSummary(currency);
  const { data: departments, isLoading: isDeptsLoading } = useDepartmentAnalytics(currency);
  const { data: countries, isLoading: isCountriesLoading } = useCountryAnalytics(currency);

  const handleAddEmployee = () => {
    toast.info('Add Employee modal will be connected in Phase 2 Step 3');
  };

  const handleImportCsv = () => {
    toast.info('CSV Import modal will be connected in Phase 2 Step 3');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* 1. Global Header Bar */}
      <GlobalHeader
        onAddEmployee={handleAddEmployee}
        onImportCsv={handleImportCsv}
      />

      {/* 2. Main Dashboard Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Section Header: How ACME Pays */}
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

        {/* 3. Top Section KPI Metrics Strip */}
        <KpiMetricsStrip
          summary={summary}
          currency={currency}
          isLoading={isSummaryLoading}
        />

        {/* 4. Analytical Visualizations Row (Departmental & Geographic) */}
        <CompensationCharts
          departments={departments}
          countries={countries}
          currency={currency}
          isLoading={isDeptsLoading || isCountriesLoading}
        />

        {/* 5. Placeholder for Phase 2 Step 2 Data Grid */}
        <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center sm:p-10 transition-colors">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Users2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Phase 2 Step 1 Analytics Visualizations Active
          </h3>
          <p className="mx-auto mt-1 max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
            KPI Metrics Strip and Compensation Visualizations are live with dynamic multi-currency calculations. Next: Server-Driven Employee Data Grid with TanStack Table.
          </p>
        </div>
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
