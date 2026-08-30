import { describe, it, expect } from 'vitest';
import {
  employeeFormSchema,
  csvRowSchema,
  employeeFilterParamsSchema,
} from '@/lib/validations/employee';

describe('Employee Validation Schemas', () => {
  describe('employeeFormSchema', () => {
    const validFormData = {
      name: 'Sarah Connor',
      email: 'sarah.connor@acme.corp',
      job_title: 'Staff Security Engineer',
      department: 'Engineering',
      country: 'United States',
      city: 'San Francisco',
      currency: 'USD',
      base_salary: 165000,
      bonus: 25000,
      employment_type: 'Full-time' as const,
      status: 'Active' as const,
      salary_change_note: 'Annual performance adjustment',
    };

    it('should validate a complete, valid employee form input', () => {
      const result = employeeFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Sarah Connor');
        expect(result.data.base_salary).toBe(165000);
      }
    });

    it('should reject invalid or malformed email addresses', () => {
      const invalidEmails = ['invalid-email', 'sarah@', '@corp.com', 'sarah space@corp.com'];
      invalidEmails.forEach((email) => {
        const result = employeeFormSchema.safeParse({ ...validFormData, email });
        expect(result.success).toBe(false);
        if (!result.success) {
          const emailError = result.error.errors.find((e) => e.path.includes('email'));
          expect(emailError?.message).toMatch(/Invalid email address/i);
        }
      });
    });

    it('should reject negative or zero base salary', () => {
      const invalidSalaries = [-5000, 0, -0.01];
      invalidSalaries.forEach((base_salary) => {
        const result = employeeFormSchema.safeParse({ ...validFormData, base_salary });
        expect(result.success).toBe(false);
        if (!result.success) {
          const salaryError = result.error.errors.find((e) => e.path.includes('base_salary'));
          expect(salaryError?.message).toMatch(/Base salary must be greater than 0/i);
        }
      });
    });

    it('should reject negative bonus values', () => {
      const result = employeeFormSchema.safeParse({ ...validFormData, bonus: -100 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const bonusError = result.error.errors.find((e) => e.path.includes('bonus'));
        expect(bonusError?.message).toMatch(/Bonus cannot be negative/i);
      }
    });

    it('should accept 0 bonus value', () => {
      const result = employeeFormSchema.safeParse({ ...validFormData, bonus: 0 });
      expect(result.success).toBe(true);
    });

    it('should coerce string numbers to numeric values', () => {
      const result = employeeFormSchema.safeParse({
        ...validFormData,
        base_salary: '120000',
        bonus: '15000',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.base_salary).toBe(120000);
        expect(result.data.bonus).toBe(15000);
      }
    });

    it('should reject invalid employment_type enums', () => {
      const result = employeeFormSchema.safeParse({
        ...validFormData,
        employment_type: 'Freelance',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid status enums', () => {
      const result = employeeFormSchema.safeParse({
        ...validFormData,
        status: 'Retired',
      });
      expect(result.success).toBe(false);
    });

    it('should trim string values and reject empty strings for required fields', () => {
      const result = employeeFormSchema.safeParse({
        ...validFormData,
        name: '   ',
        job_title: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('csvRowSchema', () => {
    const validCsvRow = {
      name: 'Marcus Vance',
      email: 'm.vance@acme.corp',
      job_title: 'Senior Product Designer',
      department: 'Design',
      country: 'United Kingdom',
      city: 'London',
      currency: 'GBP',
      base_salary: '85000',
      bonus: '8000',
      employment_type: 'Full-time',
      status: 'Active',
    };

    it('should validate and coerce valid CSV row data', () => {
      const result = csvRowSchema.safeParse(validCsvRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.base_salary).toBe(85000);
        expect(result.data.bonus).toBe(8000);
        expect(result.data.employment_type).toBe('Full-time');
      }
    });

    it('should default status to Active if omitted', () => {
      const withoutStatus: Record<string, unknown> = { ...validCsvRow };
      delete withoutStatus.status;
      const result = csvRowSchema.safeParse(withoutStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('Active');
      }
    });

    it('should reject CSV row with invalid email', () => {
      const result = csvRowSchema.safeParse({ ...validCsvRow, email: 'notanemail' });
      expect(result.success).toBe(false);
    });
  });

  describe('employeeFilterParamsSchema', () => {
    it('should parse and supply default values for empty filter query', () => {
      const result = employeeFilterParamsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(25);
        expect(result.data.currency).toBe('USD');
      }
    });

    it('should coerce string page and limit parameters', () => {
      const result = employeeFilterParamsSchema.safeParse({
        page: '3',
        limit: '50',
        sort_by: 'base_salary',
        sort_order: 'desc',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(50);
        expect(result.data.sort_by).toBe('base_salary');
        expect(result.data.sort_order).toBe('desc');
      }
    });

    it('should handle array or single string filters', () => {
      const singleDept = employeeFilterParamsSchema.safeParse({ department: 'Engineering' });
      expect(singleDept.success).toBe(true);

      const arrayDept = employeeFilterParamsSchema.safeParse({
        department: ['Engineering', 'Design'],
      });
      expect(arrayDept.success).toBe(true);
    });
  });
});
