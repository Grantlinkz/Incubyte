'use client';

import { useState, useEffect } from 'react';
import { Search, X, Download, RotateCcw } from 'lucide-react';
import { DEPARTMENTS, LOCATIONS } from '@/lib/mock-data';
import type { EmployeeFilterParams, EmployeeStatus, EmploymentType } from '@/lib/types';
import { exportEmployeesToCsv } from '@/hooks/use-employees';

interface TableToolbarProps {
  filters: EmployeeFilterParams;
  onFilterChange: (newFilters: Partial<EmployeeFilterParams>) => void;
  onResetFilters: () => void;
  totalRecords?: number;
  isLoading?: boolean;
}

export function TableToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  totalRecords = 0,
  isLoading = false,
}: TableToolbarProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Debounced search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || '')) {
        onFilterChange({ search: searchValue || undefined, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFilterChange]);

  // Synchronize internal search state if URL changes externally
  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  // Unique country list from LOCATIONS
  const countryOptions = Array.from(new Set(LOCATIONS.map((l) => l.country)));

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.department && filters.department.length > 0) ||
      (filters.country && filters.country.length > 0) ||
      (filters.employment_type && filters.employment_type.length > 0) ||
      (filters.status && filters.status.length > 0)
  );

  const handleExport = () => {
    exportEmployeesToCsv(filters);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors">
      {/* Left side: Search & Faceted Filter Selects */}
      <div className="flex items-center gap-2.5 flex-1 min-w-[280px] flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name, title, department, or ID..."
            className="w-full bg-background border border-border rounded-md pl-9 pr-8 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('');
                onFilterChange({ search: undefined, page: 1 });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* Faceted Dropdowns */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Department Filter */}
          <select
            value={Array.isArray(filters.department) ? filters.department[0] || '' : filters.department || ''}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({ department: val ? [val] : undefined, page: 1 });
            }}
            className="bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">Department: All</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Country Filter */}
          <select
            value={Array.isArray(filters.country) ? filters.country[0] || '' : filters.country || ''}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({ country: val ? [val] : undefined, page: 1 });
            }}
            className="bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">Country: All</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={
              Array.isArray(filters.employment_type)
                ? filters.employment_type[0] || ''
                : filters.employment_type || ''
            }
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({ employment_type: val ? [val as EmploymentType] : undefined, page: 1 });
            }}
            className="bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">Type: All</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contractor">Contractor</option>
          </select>

          {/* Status Filter */}
          <select
            value={Array.isArray(filters.status) ? filters.status[0] || '' : filters.status || ''}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({ status: val ? [val as EmployeeStatus] : undefined, page: 1 });
            }}
            className="bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">Status: All</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Terminated">Terminated</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Right side: Export CSV & Record Counter */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground hidden lg:inline">
          {isLoading ? (
            'Searching...'
          ) : (
            <>
              <strong className="text-foreground font-mono font-semibold">
                {totalRecords.toLocaleString()}
              </strong>{' '}
              matching records
            </>
          )}
        </span>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 border border-border bg-background hover:bg-muted text-foreground px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-2xs"
        >
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
