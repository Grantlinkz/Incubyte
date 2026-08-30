export type Currency = 'USD' | 'EUR' | 'GBP';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contractor';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Employee {
  id: string;
  name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  city: string;
  currency: string;
  base_salary: number;
  bonus: number;
  salary_usd: number;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface EmployeeFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string[];
  country?: string[];
  employment_type?: EmploymentType[];
  status?: EmployeeStatus[];
  sort_by?: keyof Employee | string;
  sort_order?: 'asc' | 'desc';
  currency?: Currency;
}

export interface SalaryHistoryItem {
  id: string;
  employee_id: string;
  previous_salary: number;
  new_salary: number;
  change_date: string;
  reason: string;
  changed_by: string;
  diff_amount: number;
  diff_percentage: number;
  currency: string;
}

export interface CurrencyBreakdown {
  currency: string;
  count: number;
  total: number;
}

export interface StatusBreakdown {
  status: EmployeeStatus;
  count: number;
}

export interface AnalyticsSummary {
  total_payroll: number;
  average_salary: number;
  median_salary: number;
  active_headcount: number;
  currency: Currency;
  currency_breakdown: CurrencyBreakdown[];
  status_breakdown: StatusBreakdown[];
  mom_payroll_trend_pct?: number;
}

export interface DepartmentAnalytics {
  department: string;
  total_payroll: number;
  avg_salary: number;
  headcount: number;
  currency: Currency;
}

export interface CountryAnalytics {
  country: string;
  total_payroll: number;
  avg_salary: number;
  headcount: number;
  currency: Currency;
}

export interface SalaryDiffCalculation {
  previousSalary: number;
  proposedSalary: number;
  diffAmount: number;
  diffPercentage: number;
  isIncrease: boolean;
  isDecrease: boolean;
  isUnchanged: boolean;
}
