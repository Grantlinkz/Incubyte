'use client';

import { useSalaryHistory } from '@/hooks/use-employees';
import type { Employee } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface SalaryHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

export function SalaryHistorySheet({ isOpen, onClose, employee }: SalaryHistorySheetProps) {
  const { data: history = [], isLoading } = useSalaryHistory(employee?.id);

  if (!isOpen || !employee) return null;

  const handleExportHistory = () => {
    try {
      const headers = ['Record ID', 'Change Date', 'Previous Salary', 'New Salary', 'Diff Amount', 'Diff %', 'Currency', 'Reason', 'Changed By'];
      const rows = history.map((h) => [
        `"${h.id}"`,
        `"${h.change_date}"`,
        h.previous_salary,
        h.new_salary,
        h.diff_amount,
        h.diff_percentage,
        `"${h.currency}"`,
        `"${h.reason.replace(/"/g, '""')}"`,
        `"${h.changed_by}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `salary-history-${employee.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported salary history for ${employee.name}`);
    } catch {
      toast.error('Failed to export salary history.');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-surface-container border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-border bg-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
                {getInitials(employee.name)}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-base font-bold tracking-tight text-foreground truncate m-0">
                  {employee.name}
                </h2>
                <p className="text-xs text-muted-foreground truncate m-0 mt-0.5">
                  {employee.job_title} • <span className="font-mono text-primary">{employee.id}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Compensation History
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportHistory}
                disabled={history.length === 0}
                className="h-8 text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>

            {/* Current Comp Summary Card */}
            <div className="p-4 rounded-xl bg-surface-container-high/70 border border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Current Base Salary
                  </span>
                  <span className="block text-xl font-bold font-mono text-primary">
                    {formatCurrency(employee.base_salary, employee.currency)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      {employee.currency} / yr
                    </span>
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Department & Office
                  </span>
                  <span className="block text-xs font-medium text-foreground">
                    {employee.department}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {employee.city}, {employee.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Revision Timeline */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Adjustment Audit Trail ({history.length} events)
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-lg bg-muted/40 animate-pulse border border-border"
                    />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-muted/20 border border-dashed border-border text-muted-foreground text-xs">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                  No previous salary adjustments recorded for this employee.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {history.map((item, idx) => {
                    const isIncrease = item.diff_amount >= 0;
                    return (
                      <div key={item.id || idx} className="relative group">
                        {/* Timeline Node */}
                        <div
                          className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 bg-background flex items-center justify-center ${
                            isIncrease
                              ? 'border-emerald-500 text-emerald-500'
                              : 'border-rose-500 text-rose-500'
                          }`}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              isIncrease ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>

                        {/* Item Card */}
                        <div className="p-3.5 rounded-lg bg-surface-container-high/40 hover:bg-surface-container-high/70 border border-border transition-colors space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                              {item.reason.includes('Promotion') ? 'Role Promotion' : 'Salary Revision'}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                              <Calendar className="h-3 w-3" />
                              {item.change_date}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <div className="text-[11px] text-muted-foreground">Adjusted To</div>
                              <div className="text-sm font-bold font-mono text-foreground">
                                {formatCurrency(item.new_salary, item.currency)}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[11px] text-muted-foreground">Diff Impact</div>
                              <div
                                className={`inline-flex items-center gap-1 text-xs font-mono font-bold ${
                                  isIncrease ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                              >
                                {isIncrease ? (
                                  <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5" />
                                )}
                                {isIncrease ? '+' : ''}
                                {formatCurrency(item.diff_amount, item.currency)} ({isIncrease ? '+' : ''}
                                {item.diff_percentage}%)
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="truncate italic">"{item.reason}"</span>
                            <span className="font-mono text-[10px] shrink-0 text-muted-foreground/80">
                              {item.changed_by}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border bg-surface-container-high flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
              Close Drawer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
