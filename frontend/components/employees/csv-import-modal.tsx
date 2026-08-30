'use client';

import { useRef, useState } from 'react';
import { useBulkImportEmployees } from '@/hooks/use-employees';
import { csvRowSchema, type CsvRowValues } from '@/lib/validations/employee';
import type { Employee } from '@/lib/types';
import { getExchangeRate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRowResult {
  raw: Record<string, string>;
  parsed?: CsvRowValues;
  isValid: boolean;
  errors: string[];
}

export function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const bulkImportMutation = useBulkImportEmployees();

  const validRows = parsedRows.filter((r) => r.isValid);
  const issueRows = parsedRows.filter((r) => !r.isValid);

  const handleDownloadTemplate = () => {
    const headers = [
      'name',
      'email',
      'job_title',
      'department',
      'country',
      'city',
      'currency',
      'base_salary',
      'bonus',
      'employment_type',
      'status',
    ];
    const sampleRows = [
      'David Kim,dkim@acmeglobal.com,Data Analyst,Engineering,United States,San Francisco,USD,115000,10000,Full-time,Active',
      'Elena Martinez,elena.m@acmeglobal.com,Product Designer,Design,Germany,Berlin,EUR,85000,5000,Full-time,Active',
      'Alistair Finch,a.finch@acmeglobal.com,Operations Specialist,Operations,United Kingdom,London,GBP,68000,4000,Contractor,Active',
    ];
    const csvContent = [headers.join(','), ...sampleRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'acme_employee_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCsvContent = (csvText: string, fileTitle: string) => {
    setIsParsing(true);
    try {
      const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length <= 1) {
        toast.error('CSV file is empty or missing data rows.');
        setIsParsing(false);
        return;
      }

      // Simple CSV split handling quotes
      const parseCsvLine = (text: string) => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headerRow = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
      const results: ParsedRowResult[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        const rowObj: Record<string, string> = {};

        headerRow.forEach((head, idx) => {
          rowObj[head] = values[idx] ?? '';
        });

        // Normalize field names if slightly different
        const normalized = {
          name: rowObj.name || `${rowObj.firstname || ''} ${rowObj.lastname || ''}`.trim() || rowObj.employeename || '',
          email: rowObj.email || rowObj.workemail || '',
          job_title: rowObj.jobtitle || rowObj.role || rowObj.title || '',
          department: rowObj.department || rowObj.dept || 'Engineering',
          country: rowObj.country || 'United States',
          city: rowObj.city || 'San Francisco',
          currency: (rowObj.currency || 'USD').toUpperCase(),
          base_salary: Number(rowObj.basesalary || rowObj.salary || 0),
          bonus: Number(rowObj.bonus || 0),
          employment_type: rowObj.employmenttype || rowObj.type || 'Full-time',
          status: rowObj.status || 'Active',
        };

        const validation = csvRowSchema.safeParse(normalized);
        if (validation.success) {
          results.push({
            raw: rowObj,
            parsed: validation.data,
            isValid: true,
            errors: [],
          });
        } else {
          const errMsgs = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
          results.push({
            raw: rowObj,
            isValid: false,
            errors: errMsgs,
          });
        }
      }

      setFileName(fileTitle);
      setParsedRows(results);
      toast.info(`Parsed ${results.length} rows (${results.filter((r) => r.isValid).length} valid, ${results.filter((r) => !r.isValid).length} issues)`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse CSV file. Ensure valid comma-separated format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please upload a valid .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please drop a valid .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (validRows.length === 0) {
      toast.error('No valid rows to import.');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const recordsToImport: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[] = validRows.map((r) => {
      const data = r.parsed!;
      const rate = getExchangeRate(data.currency, 'USD');
      const salary_usd = Math.round((data.base_salary + data.bonus) * rate);

      return {
        name: data.name,
        email: data.email,
        job_title: data.job_title,
        department: data.department,
        country: data.country,
        city: data.city,
        currency: data.currency,
        base_salary: data.base_salary,
        bonus: data.bonus,
        salary_usd,
        employment_type: data.employment_type,
        status: data.status,
        start_date: todayStr,
      };
    });

    await bulkImportMutation.mutateAsync(recordsToImport);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFileName(null);
    setParsedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-surface-container border border-border shadow-2xl rounded-xl sm:max-w-4xl">
        <div className="flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface-container-high flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Batch CSV Import
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload and validate new employee records before committing to the database.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs h-8 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Template
            </Button>
          </DialogHeader>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-card">
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border bg-surface hover:bg-surface-container-high/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-3">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {fileName ? `File: ${fileName}` : 'Drag and drop your CSV here'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                or click to browse from your computer. Headers should match name, email, department, salary, currency. Max file size: 50MB.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 pointer-events-none"
              >
                {fileName ? 'Choose Another File' : 'Select CSV File'}
              </Button>
            </div>

            {/* Validation Preview Section */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Validation Preview</h4>
                    <p className="text-xs text-muted-foreground">
                      Reviewing {parsedRows.length} parsed records from &apos;{fileName}&apos;
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {validRows.length} Valid
                    </span>
                    {issueRows.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {issueRows.length} Issues
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview Table */}
                <div className="rounded-lg border border-border overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground font-semibold sticky top-0 border-b border-border">
                      <tr>
                        <th className="py-2 px-3 w-10 text-center">Status</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Role</th>
                        <th className="py-2 px-3">Department</th>
                        <th className="py-2 px-3 text-right">Base Salary</th>
                        <th className="py-2 px-3">Validation Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.slice(0, 50).map((row, idx) => (
                        <tr
                          key={idx}
                          className={`h-10 transition-colors ${
                            row.isValid ? 'bg-card hover:bg-muted/30' : 'bg-destructive/5 hover:bg-destructive/10'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            {row.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-rose-500 inline" />
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-foreground">
                            {row.parsed?.name || row.raw.name || row.raw.employeename || '—'}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground font-mono">
                            {row.parsed?.email || row.raw.email || '—'}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">
                            {row.parsed?.job_title || row.raw.job_title || row.raw.role || '—'}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">
                            {row.parsed?.department || row.raw.department || '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-foreground">
                            {row.parsed
                              ? `${row.parsed.currency} ${row.parsed.base_salary.toLocaleString()}`
                              : row.raw.base_salary || '—'}
                          </td>
                          <td className="py-2 px-3 text-xs">
                            {row.isValid ? (
                              <span className="text-emerald-500 font-medium">Ready to import</span>
                            ) : (
                              <span className="text-rose-500 font-mono text-[11px] truncate max-w-xs block">
                                {row.errors.join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-border bg-surface-container-high flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset();
                onClose();
              }}
              disabled={bulkImportMutation.isPending}
              className="text-xs h-9"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              {parsedRows.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  disabled={bulkImportMutation.isPending}
                  className="text-xs h-9"
                >
                  Clear Data
                </Button>
              )}
              <Button
                type="button"
                onClick={handleCommitImport}
                disabled={validRows.length === 0 || bulkImportMutation.isPending}
                className="text-xs h-9 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 gap-1.5"
              >
                {bulkImportMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Importing Records...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Commit {validRows.length} Valid Records
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
