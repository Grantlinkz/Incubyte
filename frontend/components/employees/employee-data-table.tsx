'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import type { Employee, EmployeeFilterParams, PaginatedResponse } from '@/lib/types';
import { formatCurrency, getCountryFlag, getOfficeCode } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserX,
} from 'lucide-react';

interface EmployeeDataTableProps {
  data?: PaginatedResponse<Employee>;
  isLoading?: boolean;
  filters: EmployeeFilterParams;
  onFilterChange: (newFilters: Partial<EmployeeFilterParams>) => void;
  onEditEmployee?: (employee: Employee) => void;
  onViewHistory?: (employee: Employee) => void;
  onDeleteEmployee?: (employee: Employee) => void;
}

export function EmployeeDataTable({
  data,
  isLoading = false,
  filters,
  onFilterChange,
  onEditEmployee,
  onViewHistory,
  onDeleteEmployee,
}: EmployeeDataTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const employees = data?.items || [];
  const total = data?.total || 0;
  const page = data?.page || 1;
  const limit = data?.limit || 25;
  const totalPages = data?.total_pages || 1;

  // Sorting state synced with filters
  const sorting: SortingState = useMemo(() => {
    if (!filters.sort_by) return [];
    return [{ id: filters.sort_by, desc: filters.sort_order === 'desc' }];
  }, [filters.sort_by, filters.sort_order]);

  const handleSort = useCallback(
    (columnId: string) => {
      if (filters.sort_by === columnId) {
        if (filters.sort_order === 'asc') {
          onFilterChange({ sort_by: columnId, sort_order: 'desc' });
        } else {
          onFilterChange({ sort_by: undefined, sort_order: undefined });
        }
      } else {
        onFilterChange({ sort_by: columnId, sort_order: 'asc' });
      }
    },
    [filters.sort_by, filters.sort_order, onFilterChange]
  );

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      // 1. Checkbox Column
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="rounded-xs border-border bg-background text-primary focus:ring-1 focus:ring-primary h-3.5 w-3.5 cursor-pointer"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="rounded-xs border-border bg-background text-primary focus:ring-1 focus:ring-primary h-3.5 w-3.5 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ),
        size: 40,
        enableSorting: false,
      },

      // 2. Employee Info
      {
        id: 'name',
        accessorKey: 'name',
        header: () => (
          <button
            onClick={() => handleSort('name')}
            className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Employee</span>
            {filters.sort_by === 'name' ? (
              filters.sort_order === 'desc' ? (
                <ArrowDown className="h-3 w-3 text-primary" />
              ) : (
                <ArrowUp className="h-3 w-3 text-primary" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div>
              <div className="font-medium text-foreground text-xs leading-snug">{emp.name}</div>
              <div className="text-[11px] text-muted-foreground font-mono leading-none mt-0.5">
                {emp.email}
              </div>
            </div>
          );
        },
      },

      // 3. Title & Dept
      {
        id: 'department',
        accessorKey: 'department',
        header: () => (
          <button
            onClick={() => handleSort('department')}
            className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Title &amp; Dept</span>
            {filters.sort_by === 'department' ? (
              filters.sort_order === 'desc' ? (
                <ArrowDown className="h-3 w-3 text-primary" />
              ) : (
                <ArrowUp className="h-3 w-3 text-primary" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div>
              <div className="font-medium text-foreground text-xs">{emp.job_title}</div>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-xs bg-muted text-[10px] font-medium text-muted-foreground border border-border mt-0.5">
                {emp.department}
              </span>
            </div>
          );
        },
      },

      // 4. Location
      {
        id: 'country',
        accessorKey: 'country',
        header: () => (
          <button
            onClick={() => handleSort('country')}
            className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Location</span>
            {filters.sort_by === 'country' ? (
              filters.sort_order === 'desc' ? (
                <ArrowDown className="h-3 w-3 text-primary" />
              ) : (
                <ArrowUp className="h-3 w-3 text-primary" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const emp = row.original;
          const flag = getCountryFlag(emp.country);
          const officeCode = getOfficeCode(emp.country, emp.city);
          return (
            <div className="flex items-center gap-2">
              <span className="text-base leading-none select-none">{flag}</span>
              <div>
                <div className="font-medium text-foreground text-xs">
                  {emp.city ? `${emp.city}, ${emp.country}` : emp.country}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5">
                  {officeCode}
                </div>
              </div>
            </div>
          );
        },
      },

      // 5. Status
      {
        id: 'status',
        accessorKey: 'status',
        header: () => (
          <span className="font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">
            Status
          </span>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          let statusStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
          if (status === 'On Leave') {
            statusStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
          } else if (status === 'Terminated') {
            statusStyle = 'bg-muted text-muted-foreground border-border';
          }

          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium border ${statusStyle}`}
            >
              {status}
            </span>
          );
        },
      },

      // 6. Local Comp (Right Aligned)
      {
        id: 'base_salary',
        accessorKey: 'base_salary',
        header: () => (
          <div className="flex justify-end w-full">
            <button
              onClick={() => handleSort('base_salary')}
              className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Local Comp</span>
              {filters.sort_by === 'base_salary' ? (
                filters.sort_order === 'desc' ? (
                  <ArrowDown className="h-3 w-3 text-primary" />
                ) : (
                  <ArrowUp className="h-3 w-3 text-primary" />
                )
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-40" />
              )}
            </button>
          </div>
        ),
        cell: ({ row }) => {
          const emp = row.original;
          const formattedBase = formatCurrency(emp.base_salary, emp.currency);
          const formattedBonus =
            emp.bonus > 0 ? formatCurrency(emp.bonus, emp.currency, { compact: true }) : null;

          return (
            <div className="text-right">
              <div className="font-mono text-xs font-medium text-foreground">{formattedBase}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {formattedBonus ? `+${formattedBonus} Bonus` : 'No Bonus'}
              </div>
            </div>
          );
        },
      },

      // 7. Norm Salary USD (Right Aligned)
      {
        id: 'salary_usd',
        accessorKey: 'salary_usd',
        header: () => (
          <div className="flex justify-end w-full">
            <button
              onClick={() => handleSort('salary_usd')}
              className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Norm Salary (USD)</span>
              {filters.sort_by === 'salary_usd' ? (
                filters.sort_order === 'desc' ? (
                  <ArrowDown className="h-3 w-3 text-primary" />
                ) : (
                  <ArrowUp className="h-3 w-3 text-primary" />
                )
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-40" />
              )}
            </button>
          </div>
        ),
        cell: ({ row }) => {
          const emp = row.original;
          const formattedUSD = formatCurrency(emp.salary_usd, 'USD');
          return (
            <div className="text-right">
              <span className="font-mono text-xs font-semibold text-foreground bg-muted/60 dark:bg-slate-900/60 px-2 py-0.8 rounded-xs border border-border shadow-2xs inline-block">
                {formattedUSD}
              </span>
            </div>
          );
        },
      },

      // 8. Sticky Actions Dropdown
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Employee Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-xs">
                  <DropdownMenuItem
                    onClick={() => onEditEmployee?.(emp)}
                    className="cursor-pointer gap-2"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Edit Profile &amp; Salary</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onViewHistory?.(emp)}
                    className="cursor-pointer gap-2"
                  >
                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>View Salary History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteEmployee?.(emp)}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    <span>Delete Record</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 44,
        enableSorting: false,
      },
    ],
    [filters.sort_by, filters.sort_order, handleSort, onEditEmployee, onViewHistory, onDeleteEmployee]
  );

  const table = useReactTable({
    data: employees,
    columns,
    state: {
      rowSelection,
      sorting,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
  });

  // Calculate smart pagination pages
  const startRecord = Math.min((page - 1) * limit + 1, total);
  const endRecord = Math.min(page * limit, total);

  const renderPaginationButtons = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-xs font-mono">
            ...
          </span>
        );
      }

      const isCurrent = p === page;
      return (
        <button
          key={`page-${p}`}
          onClick={() => onFilterChange({ page: Number(p) })}
          className={`h-7 min-w-[28px] px-1.5 rounded-sm text-xs font-mono font-medium transition-colors ${
            isCurrent
              ? 'bg-primary text-primary-foreground font-bold shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden flex flex-col transition-colors">
      {/* Table Canvas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3.5 py-2 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-border text-xs text-foreground">
            {isLoading ? (
              // Skeleton rows during loading
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="h-[48px]">
                  <td className="px-3.5 py-2 text-center">
                    <Skeleton className="h-3.5 w-3.5 mx-auto" />
                  </td>
                  <td className="px-3.5 py-2">
                    <Skeleton className="h-3.5 w-32 mb-1" />
                    <Skeleton className="h-2.5 w-24" />
                  </td>
                  <td className="px-3.5 py-2">
                    <Skeleton className="h-3.5 w-28 mb-1" />
                    <Skeleton className="h-2.5 w-16" />
                  </td>
                  <td className="px-3.5 py-2">
                    <Skeleton className="h-3.5 w-24" />
                  </td>
                  <td className="px-3.5 py-2">
                    <Skeleton className="h-5 w-14 rounded-xs" />
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <Skeleton className="h-3.5 w-20 ml-auto mb-1" />
                    <Skeleton className="h-2.5 w-14 ml-auto" />
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <Skeleton className="h-6 w-20 ml-auto rounded-xs" />
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <Skeleton className="h-4 w-4 ml-auto" />
                  </td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                    <UserX className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">No employees found</h4>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                    Try refining your search keyword or clearing the active department/country filters.
                  </p>
                </td>
              </tr>
            ) : (
              // Active Data Rows
              table.getRowModel().rows.map((row) => {
                const isSelected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    className={`h-[48px] transition-colors group ${
                      isSelected
                        ? 'bg-primary/10 hover:bg-primary/15'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3.5 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-muted/20 border-t border-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        {/* Left side: range and rows per page selector */}
        <div className="flex items-center gap-4">
          <span>
            Showing{' '}
            <strong className="font-mono text-foreground font-medium">
              {total > 0 ? `${startRecord}–${endRecord}` : '0'}
            </strong>{' '}
            of{' '}
            <strong className="font-mono text-foreground font-medium">
              {total.toLocaleString()}
            </strong>{' '}
            records
          </span>

          <div className="hidden sm:flex items-center gap-1.5">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => onFilterChange({ limit: Number(e.target.value), page: 1 })}
              className="bg-background border border-border rounded-xs px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Right side: Numeric Pagination Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onFilterChange({ page: Math.max(1, page - 1) })}
            disabled={page <= 1 || isLoading}
            className="p-1 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {renderPaginationButtons()}

          <button
            onClick={() => onFilterChange({ page: Math.min(totalPages, page + 1) })}
            disabled={page >= totalPages || isLoading}
            className="p-1 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
