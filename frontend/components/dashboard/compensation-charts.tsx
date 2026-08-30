'use client';

import { useState } from 'react';
import type { CountryAnalytics, Currency, DepartmentAnalytics } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CompensationChartsSkeleton } from '@/components/ui/skeleton-states';
import { QueryErrorFallback } from '@/components/ui/query-error-fallback';
import { Building2, Globe2, BarChart2, List } from 'lucide-react';

interface CompensationChartsProps {
  departments?: DepartmentAnalytics[];
  countries?: CountryAnalytics[];
  currency: Currency;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function CompensationCharts({
  departments = [],
  countries = [],
  currency,
  isLoading,
  isError,
  onRetry,
}: CompensationChartsProps) {
  const [activeDeptTab, setActiveDeptTab] = useState<'bars' | 'ranked'>('bars');

  if (isError) {
    return (
      <QueryErrorFallback
        title="Unable to render compensation charts"
        message="Failed to retrieve departmental and geographic payroll distributions."
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <CompensationChartsSkeleton />;
  }

  // Max department spend for relative scaling
  const maxDeptSpend = departments.length > 0 ? Math.max(...departments.map((d) => d.total_payroll)) : 1;
  const maxCountrySpend = countries.length > 0 ? Math.max(...countries.map((c) => c.total_payroll)) : 1;
  const maxCountryHC = countries.length > 0 ? Math.max(...countries.map((c) => c.headcount)) : 1;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 1. Departmental Spend Breakdown */}
      <div className="rounded-lg border border-border bg-card shadow-xs flex flex-col h-[420px] overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Departmental Spend
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Annual run rate &amp; allocation by functional group
            </p>
          </div>
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded border border-border">
            <button
              onClick={() => setActiveDeptTab('bars')}
              className={`p-1 rounded text-xs transition-colors ${
                activeDeptTab === 'bars'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Bar Meter View"
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveDeptTab('ranked')}
              className={`p-1 rounded text-xs transition-colors ${
                activeDeptTab === 'ranked'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Ranked List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
          {departments.map((dept, idx) => {
            const pct = Math.max(8, Math.round((dept.total_payroll / maxDeptSpend) * 100));
            const formattedTotal = formatCurrency(dept.total_payroll, currency, { compact: true });
            const formattedAvg = formatCurrency(dept.avg_salary, currency, { compact: false });

            if (activeDeptTab === 'ranked') {
              return (
                <div
                  key={dept.department}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors text-xs border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-muted-foreground font-mono text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-foreground">{dept.department}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-mono">
                      {dept.headcount} HC
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-muted-foreground text-[11px]">Avg: {formattedAvg}</span>
                    <span className="font-bold text-foreground">{formattedTotal}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={dept.department}
                className="group flex items-center gap-3 text-xs"
              >
                {/* Department Label */}
                <span className="w-28 text-right font-medium text-muted-foreground group-hover:text-foreground truncate transition-colors">
                  {dept.department}
                </span>

                {/* Progress Bar & Value Tag */}
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-6 flex-1 bg-muted/30 rounded-r border border-border/40 overflow-hidden relative">
                    <div
                      className="h-full bg-blue-600/80 dark:bg-blue-500/70 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 rounded-r transition-all duration-300 flex items-center justify-between px-2"
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-[11px] font-mono font-medium text-white drop-shadow-xs truncate">
                        {formattedTotal}
                      </span>
                    </div>
                  </div>
                  {/* Headcount pill */}
                  <span className="text-[10px] font-mono text-muted-foreground w-12 text-right shrink-0">
                    {dept.headcount} HC
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Geographic Distribution Breakdown */}
      <div className="rounded-lg border border-border bg-card shadow-xs flex flex-col h-[420px] overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Geographic Distribution
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Spend vs. Headcount comparison across regional offices
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500" />
              <span>Spend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span>Headcount</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {countries.map((country) => {
            const spendPct = Math.max(6, Math.round((country.total_payroll / maxCountrySpend) * 100));
            const hcPct = Math.max(6, Math.round((country.headcount / maxCountryHC) * 100));
            const formattedTotal = formatCurrency(country.total_payroll, currency, { compact: true });

            return (
              <div key={country.country} className="space-y-1.5 group">
                {/* Header: Country Name + Numeric Stats */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {country.country}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-semibold text-foreground">{formattedTotal}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{country.headcount.toLocaleString()} HC</span>
                  </div>
                </div>

                {/* Dual Track Bar Meters */}
                <div className="space-y-1">
                  {/* Spend Track */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${spendPct}%` }}
                      />
                    </div>
                  </div>
                  {/* Headcount Track */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-300"
                        style={{ width: `${hcPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
