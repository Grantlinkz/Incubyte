'use client';

import React, { Suspense } from 'react';
import { FileUp, Plus, ChevronDown } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import type { Currency } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

interface GlobalHeaderProps {
  onAddEmployee?: () => void;
  onImportCsv?: () => void;
}

function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="base-currency-select"
        className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
      >
        Base Currency
      </label>
      <div className="relative">
        <select
          id="base-currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="h-8 appearance-none rounded-sm border border-border bg-card pl-2.5 pr-7 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer shadow-xs"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

export function GlobalHeader({ onAddEmployee, onImportCsv }: GlobalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Branding & Status Indicator */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold text-xs tracking-wider shadow-xs">
              A
            </div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground m-0">
              ACME Compensation
            </h1>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>Global Payroll Sync • Active</span>
          </div>
        </div>

        {/* Right: Base Currency, Theme Toggle & CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Suspense
            fallback={
              <div className="h-8 w-28 rounded-sm bg-muted animate-pulse" />
            }
          >
            <CurrencySelector />
          </Suspense>

          <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

          <ThemeToggle />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onImportCsv}
            className="h-8 gap-1.5 rounded-sm border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <FileUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">Import</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onAddEmployee}
            className="h-8 gap-1.5 rounded-sm bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
