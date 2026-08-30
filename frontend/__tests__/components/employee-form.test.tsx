import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeModal } from '@/components/employees/employee-modal';
import { renderWithProviders } from '../test-utils';
import type { Employee } from '@/lib/types';

const mockEditingEmployee: Employee = {
  id: 'EMP-00101',
  name: 'Marcus Brody',
  email: 'm.brody@acme.corp',
  job_title: 'Principal Architect',
  department: 'Engineering',
  country: 'United States',
  city: 'San Francisco',
  currency: 'USD',
  base_salary: 180000,
  bonus: 25000,
  salary_usd: 205000,
  employment_type: 'Full-time',
  status: 'Active',
  start_date: '2021-01-10',
  created_at: '2021-01-10T00:00:00Z',
  updated_at: '2021-01-10T00:00:00Z',
};

describe('EmployeeModal Component (Form Workflows & Salary Diff)', () => {
  it('renders modal in Add mode when employee prop is undefined', () => {
    renderWithProviders(<EmployeeModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Add New Employee/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Employee/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Sarah Jenkins')).toHaveValue('');
  });

  it('renders modal in Edit mode populated with employee data', () => {
    renderWithProviders(
      <EmployeeModal isOpen={true} onClose={vi.fn()} employee={mockEditingEmployee} />
    );

    expect(screen.getByRole('heading', { name: /Edit Employee Details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Marcus Brody')).toBeInTheDocument();
    expect(screen.getByDisplayValue('m.brody@acme.corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Principal Architect')).toBeInTheDocument();
  });

  it('dynamically displays the live Salary Diff card when base salary changes in Edit mode', async () => {
    renderWithProviders(
      <EmployeeModal isOpen={true} onClose={vi.fn()} employee={mockEditingEmployee} />
    );

    // Initial salary is $180,000 -> Diff card shows Current: $180,000
    expect(screen.getByText(/Salary Diff Comparison/i)).toBeInTheDocument();

    const salaryInput = screen.getByLabelText(/Annual Base Salary/i);
    fireEvent.change(salaryInput, { target: { value: '200000' } });

    // Live diff card: +$20,000 (+11.11%)
    await waitFor(() => {
      expect(screen.getByText(/\+\$20,000/i)).toBeInTheDocument();
      expect(screen.getByText(/11\.11%/i)).toBeInTheDocument();
    });
  });

  it('displays form validation error when required fields are empty', async () => {
    renderWithProviders(<EmployeeModal isOpen={true} onClose={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /Create Employee/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Job title is required/i)).toBeInTheDocument();
    });
  });
});
