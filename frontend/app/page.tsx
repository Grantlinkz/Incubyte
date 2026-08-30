'use client';

import { Suspense, useState } from 'react';
import { GlobalHeader } from '@/components/layout/global-header';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { TrendingUp, Users, DollarSign, BarChart3, Layers, Building2 } from 'lucide-react';
import { getMockAnalyticsSummary } from '@/lib/mock-data';

function DashboardContent() {
  const { currency } = useCurrency();
  const summary = getMockAnalyticsSummary(currency);

  const handleAddEmployee = () => {
    toast.info('Add Employee modal will be connected in Phase 2 Step 3');
  };

  const handleImportCsv = () => {
    toast.info('CSV Import modal will be connected in Phase 2 Step 3');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <GlobalHeader
        onAddEmployee={handleAddEmployee}
        onImportCsv={handleImportCsv}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground m-0">
              Compensation Overview
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live enterprise compensation metrics across international offices and currencies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-sm bg-secondary px-2 py-1 text-xs font-mono font-medium text-secondary-foreground border border-border">
              Display Currency: <strong className="ml-1 text-primary">{currency}</strong>
            </span>
          </div>
        </div>

        {/* Preview KPI Strip Foundation */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Annual Payroll
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {formatCurrency(summary.total_payroll, currency, { compact: false })}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+3.4% vs last quarter</span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Average Base Salary
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {formatCurrency(summary.average_salary, currency)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Mean annualized compensation
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Median Base Salary
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {formatCurrency(summary.median_salary, currency)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Benchmark midpoint compensation
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Headcount
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {summary.active_headcount.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">employees</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {summary.currency_breakdown.slice(0, 4).map((c) => (
                <span
                  key={c.currency}
                  className="rounded-xs bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border border-border"
                >
                  {c.currency}: {c.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Phase 2 Canvas Placement Banner */}
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            Phase 1 Foundation &amp; Header Control Bar Active
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            API Client, TypeScript contracts, Zod schemas, URL-synced Currency switcher, and Theme provider are configured. Ready for Phase 2: Analytics Charts and Server-Driven Data Grid.
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
