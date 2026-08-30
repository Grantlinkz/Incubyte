'use client';

import type { AnalyticsSummary, Currency } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Banknote, TrendingUp, BarChart3, SlidersHorizontal, Users } from 'lucide-react';

interface KpiMetricsStripProps {
  summary?: AnalyticsSummary;
  currency: Currency;
  isLoading?: boolean;
}

export function KpiMetricsStrip({ summary, currency, isLoading }: KpiMetricsStripProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-4 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        ))}
      </div>
    );
  }

  // Format Total Payroll compact ($142.5M)
  const totalFormatted = formatCurrency(summary.total_payroll, currency, { compact: true });
  const avgFormatted = formatCurrency(summary.average_salary, currency, { compact: false });
  const medianFormatted = formatCurrency(summary.median_salary, currency, { compact: false });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Total Annual Payroll */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs transition-colors hover:border-primary/40 hover:bg-card/80 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Annual Payroll
          </span>
          <Banknote className="h-4 w-4 text-blue-500/80 group-hover:text-blue-500 transition-colors" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
            {totalFormatted}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{currency}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-snug">
          Normalized total spend across all regions.
        </p>
      </div>

      {/* KPI 2: Average Base Salary */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs transition-colors hover:border-primary/40 hover:bg-card/80 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Average Base Salary
          </span>
          <BarChart3 className="h-4 w-4 text-emerald-500/80 group-hover:text-emerald-500 transition-colors" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
            {avgFormatted}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{currency}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            +{summary.mom_payroll_trend_pct || 3.2}%
          </span>
          <span className="text-xs text-muted-foreground">vs last year</span>
        </div>
      </div>

      {/* KPI 3: Median Salary */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs transition-colors hover:border-primary/40 hover:bg-card/80 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Median Salary
          </span>
          <SlidersHorizontal className="h-4 w-4 text-purple-500/80 group-hover:text-purple-500 transition-colors" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
            {medianFormatted}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{currency}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-snug">
          Benchmark midpoint compensation.
        </p>
      </div>

      {/* KPI 4: Active Headcount */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs transition-colors hover:border-primary/40 hover:bg-card/80 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Headcount
          </span>
          <Users className="h-4 w-4 text-amber-500/80 group-hover:text-amber-500 transition-colors" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
            {summary.active_headcount.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground font-medium">Employees</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {summary.currency_breakdown.slice(0, 4).map((c) => (
            <span
              key={c.currency}
              className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-secondary-foreground border border-border"
            >
              {c.currency}
            </span>
          ))}
          {summary.currency_breakdown.length > 4 && (
            <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border border-border">
              +{summary.currency_breakdown.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
