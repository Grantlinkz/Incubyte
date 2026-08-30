'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CURRENCIES,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  employeeFormSchema,
  type EmployeeFormValues,
} from '@/lib/validations/employee';
import { DEPARTMENTS } from '@/lib/mock-data';
import type { Employee } from '@/lib/types';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { calculateSalaryDiff, formatCurrency, getExchangeRate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  DollarSign,
  Loader2,
  TrendingDown,
  TrendingUp,
  User,
} from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

const COUNTRY_OPTIONS = [
  { name: 'United States', defaultCity: 'San Francisco', currency: 'USD' },
  { name: 'United Kingdom', defaultCity: 'London', currency: 'GBP' },
  { name: 'Germany', defaultCity: 'Berlin', currency: 'EUR' },
  { name: 'Canada', defaultCity: 'Toronto', currency: 'CAD' },
  { name: 'Australia', defaultCity: 'Sydney', currency: 'AUD' },
  { name: 'Nigeria', defaultCity: 'Lagos', currency: 'NGN' },
  { name: 'Singapore', defaultCity: 'Singapore', currency: 'SGD' },
];

export function EmployeeModal({ isOpen, onClose, employee }: EmployeeModalProps) {
  const isEditing = !!employee;
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const defaultValues: EmployeeFormValues = useMemo(() => {
    if (employee) {
      return {
        name: employee.name,
        email: employee.email,
        job_title: employee.job_title,
        department: employee.department,
        country: employee.country,
        city: employee.city,
        currency: employee.currency,
        base_salary: employee.base_salary,
        bonus: employee.bonus,
        employment_type: employee.employment_type,
        status: employee.status,
        salary_change_note: '',
      };
    }
    return {
      name: '',
      email: '',
      job_title: '',
      department: 'Engineering',
      country: 'United States',
      city: 'San Francisco',
      currency: 'USD',
      base_salary: 100000,
      bonus: 10000,
      employment_type: 'Full-time',
      status: 'Active',
      salary_change_note: '',
    };
  }, [employee]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
  });

  // Reset form values whenever opened or employee changes
  useEffect(() => {
    reset(defaultValues);
  }, [employee, defaultValues, reset, isOpen]);

  // Watch form fields for live diff calculation
  const watchedBaseSalary = useWatch({ control, name: 'base_salary' }) ?? defaultValues.base_salary;
  const watchedBonus = useWatch({ control, name: 'bonus' }) ?? defaultValues.bonus;
  const watchedCurrency = useWatch({ control, name: 'currency' }) ?? defaultValues.currency;
  const watchedStatus = useWatch({ control, name: 'status' }) ?? defaultValues.status;
  const watchedCountry = useWatch({ control, name: 'country' }) ?? defaultValues.country;


  const currentOriginalSalary = employee ? employee.base_salary : watchedBaseSalary;
  const proposedSalary = Number(watchedBaseSalary) || 0;
  const proposedBonus = Number(watchedBonus) || 0;

  const diffCalculation = useMemo(() => {
    return calculateSalaryDiff(currentOriginalSalary, proposedSalary);
  }, [currentOriginalSalary, proposedSalary]);

  // Calculate estimated base in USD for aggregate stats
  const estimatedSalaryUsd = useMemo(() => {
    const rate = getExchangeRate(watchedCurrency || 'USD', 'USD');
    return Math.round((proposedSalary + proposedBonus) * rate);
  }, [watchedCurrency, proposedSalary, proposedBonus]);

  const onSubmit = async (values: EmployeeFormValues) => {
    const rate = getExchangeRate(values.currency, 'USD');
    const salary_usd = Math.round((values.base_salary + values.bonus) * rate);

    if (isEditing && employee) {
      await updateMutation.mutateAsync({
        id: employee.id,
        previousSalary: employee.base_salary,
        reason: values.salary_change_note || 'Compensation & Profile Update',
        data: {
          name: values.name,
          email: values.email,
          job_title: values.job_title,
          department: values.department,
          country: values.country,
          city: values.city,
          currency: values.currency,
          base_salary: values.base_salary,
          bonus: values.bonus,
          salary_usd,
          employment_type: values.employment_type,
          status: values.status,
        },
      });
    } else {
      const todayStr = new Date().toISOString().slice(0, 10);
      await createMutation.mutateAsync({
        name: values.name,
        email: values.email,
        job_title: values.job_title,
        department: values.department,
        country: values.country,
        city: values.city,
        currency: values.currency,
        base_salary: values.base_salary,
        bonus: values.bonus,
        salary_usd,
        employment_type: values.employment_type,
        status: values.status,
        start_date: todayStr,
      });
    }

    onClose();
  };

  const handleCountryChange = (countryName: string) => {
    setValue('country', countryName);
    const matched = COUNTRY_OPTIONS.find((c) => c.name === countryName);
    if (matched) {
      setValue('city', matched.defaultCity);
      if (!isEditing) {
        setValue('currency', matched.currency);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-surface-container border border-border shadow-2xl rounded-xl sm:max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface-container-high flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                {isEditing ? 'Edit Employee Details' : 'Add New Employee'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Update profile and compensation data for ${employee.name} (${employee.id}).`
                  : 'Create a new employee profile, department allocation, and initial compensation.'}
              </p>
            </div>
          </DialogHeader>

          {/* Modal Body - 2 Columns */}
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 bg-card">
            {/* Column 1: Personal & Role */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personal & Role
                </h3>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="emp-name" className="text-xs font-medium text-foreground">
                  Full Name *
                </label>
                <Input
                  id="emp-name"
                  {...register('name')}
                  placeholder="e.g. Sarah Jenkins"
                  className="bg-background border-border text-sm h-9"
                />
                {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label htmlFor="emp-email" className="text-xs font-medium text-foreground">
                  Work Email *
                </label>
                <Input
                  id="emp-email"
                  type="email"
                  {...register('email')}
                  placeholder="s.jenkins@acmeglobal.com"
                  className="bg-background border-border text-sm h-9"
                />
                {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
              </div>

              {/* Job Title & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="emp-job-title" className="text-xs font-medium text-foreground">
                    Job Title *
                  </label>
                  <Input
                    id="emp-job-title"
                    {...register('job_title')}
                    placeholder="e.g. Lead Engineer"
                    className="bg-background border-border text-sm h-9"
                  />
                  {errors.job_title && (
                    <p className="text-[11px] text-destructive">{errors.job_title.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Department *</label>
                  <select
                    {...register('department')}
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-[11px] text-destructive">{errors.department.message}</p>
                  )}
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Country *</label>
                  <select
                    value={watchedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-[11px] text-destructive">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">City *</label>
                  <Input
                    {...register('city')}
                    placeholder="City"
                    className="bg-background border-border text-sm h-9"
                  />
                  {errors.city && <p className="text-[11px] text-destructive">{errors.city.message}</p>}
                </div>
              </div>

              {/* Employment Type & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Employment Type *</label>
                  <select
                    {...register('employment_type')}
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.employment_type && (
                    <p className="text-[11px] text-destructive">{errors.employment_type.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Status *</label>
                  <select
                    {...register('status')}
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {EMPLOYEE_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="text-[11px] text-destructive">{errors.status.message}</p>
                  )}
                </div>
              </div>

              {/* Active Status Badge Indicator */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-muted-foreground">Current Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[11px] font-medium ${
                    watchedStatus === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : watchedStatus === 'On Leave'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      watchedStatus === 'Active'
                        ? 'bg-emerald-500'
                        : watchedStatus === 'On Leave'
                        ? 'bg-amber-500'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  {watchedStatus}
                </span>
              </div>
            </div>

            {/* Column 2: Compensation Details */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Compensation Details
                </h3>
              </div>

              {/* Currency Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Local Currency *</label>
                <select
                  {...register('currency')}
                  className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="text-[11px] text-destructive">{errors.currency.message}</p>
                )}
              </div>

              {/* Base Salary & Bonus */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="emp-base-salary" className="text-xs font-medium text-foreground">
                    Annual Base Salary *
                  </label>
                  <Input
                    id="emp-base-salary"
                    type="number"
                    step="500"
                    {...register('base_salary')}
                    placeholder="120000"
                    className="bg-background border-border text-sm h-9 font-mono"
                  />
                  {errors.base_salary && (
                    <p className="text-[11px] text-destructive">{errors.base_salary.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="emp-bonus" className="text-xs font-medium text-foreground">
                    Target Bonus
                  </label>
                  <Input
                    id="emp-bonus"
                    type="number"
                    step="500"
                    {...register('bonus')}
                    placeholder="10000"
                    className="bg-background border-border text-sm h-9 font-mono"
                  />
                  {errors.bonus && (
                    <p className="text-[11px] text-destructive">{errors.bonus.message}</p>
                  )}
                </div>
              </div>

              {/* Normalized Converted Preview */}
              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-md bg-muted/40 border border-border">
                <span className="text-muted-foreground">Total USD Equivalent (Base + Bonus):</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatCurrency(estimatedSalaryUsd, 'USD')}
                </span>
              </div>

              {/* Salary Revision Reason / Note */}
              {isEditing && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Adjustment Reason / Audit Note
                  </label>
                  <Input
                    {...register('salary_change_note')}
                    placeholder="e.g. Annual Performance Review, Band Adjustment"
                    className="bg-background border-border text-sm h-9"
                  />
                </div>
              )}

              {/* Real-time Salary Diff Comparison Card */}
              <div className="mt-1 p-4 rounded-lg bg-surface-container-high/60 border border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {diffCalculation.isIncrease ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : diffCalculation.isDecrease ? (
                      <TrendingDown className="h-4 w-4 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <span>Salary Diff Comparison</span>
                  </div>
                  {isEditing && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Currency: {watchedCurrency}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pb-2 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Base</p>
                    <p
                      className={`text-sm font-mono font-medium ${
                        isEditing && !diffCalculation.isUnchanged
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {formatCurrency(currentOriginalSalary, watchedCurrency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Proposed Base</p>
                    <p
                      className={`text-base font-mono font-bold ${
                        diffCalculation.isIncrease
                          ? 'text-emerald-500'
                          : diffCalculation.isDecrease
                          ? 'text-rose-500'
                          : 'text-foreground'
                      }`}
                    >
                      {formatCurrency(proposedSalary, watchedCurrency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs font-medium text-foreground">Net Adjustment:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                      diffCalculation.isIncrease
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : diffCalculation.isDecrease
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {diffCalculation.isIncrease && '+'}
                    {formatCurrency(diffCalculation.diffAmount, watchedCurrency)} (
                    {diffCalculation.isIncrease && '+'}
                    {diffCalculation.diffPercentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-border bg-surface-container-high flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  {isEditing ? 'Saving Changes...' : 'Creating Employee...'}
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Employee'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
