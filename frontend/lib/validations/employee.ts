import { z } from 'zod';

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'SGD', 'JPY', 'CHF'] as const;
export const BASE_CURRENCIES = ['USD', 'EUR', 'GBP'] as const;
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contractor'] as const;
export const EMPLOYEE_STATUSES = ['Active', 'On Leave', 'Terminated'] as const;

export const employeeFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
  email: z.string().trim().email('Invalid email address'),
  job_title: z.string().trim().min(2, 'Job title is required').max(100, 'Job title must be under 100 characters'),
  department: z.string().trim().min(1, 'Department is required'),
  country: z.string().trim().min(1, 'Country is required'),
  city: z.string().trim().min(1, 'City is required'),
  currency: z.string().trim().min(1, 'Currency is required'),
  base_salary: z.coerce.number().positive('Base salary must be greater than 0'),
  bonus: z.coerce.number().min(0, 'Bonus cannot be negative'),
  employment_type: z.enum(EMPLOYMENT_TYPES, {
    errorMap: () => ({ message: 'Please select a valid employment type' }),
  }),
  status: z.enum(EMPLOYEE_STATUSES, {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  salary_change_note: z.string().trim().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const csvRowSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email'),
  job_title: z.string().trim().min(1, 'Job title is required'),
  department: z.string().trim().min(1, 'Department is required'),
  country: z.string().trim().min(1, 'Country is required'),
  city: z.string().trim().min(1, 'City is required'),
  currency: z.string().trim().min(1, 'Currency is required'),
  base_salary: z.coerce.number().positive('Base salary must be positive'),
  bonus: z.coerce.number().min(0).default(0),
  employment_type: z.enum(EMPLOYMENT_TYPES),
  status: z.enum(EMPLOYEE_STATUSES).default('Active'),
});

export type CsvRowValues = z.infer<typeof csvRowSchema>;

export const employeeFilterParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(25),
  search: z.string().optional(),
  department: z.union([z.string(), z.array(z.string())]).optional(),
  country: z.union([z.string(), z.array(z.string())]).optional(),
  employment_type: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  currency: z.enum(BASE_CURRENCIES).default('USD'),
});

export type ParsedFilterParams = z.infer<typeof employeeFilterParamsSchema>;
