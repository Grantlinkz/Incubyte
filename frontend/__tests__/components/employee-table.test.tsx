import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeDataTable } from '@/components/employees/employee-data-table';
import type { Employee, PaginatedResponse } from '@/lib/types';

const mockEmployees: Employee[] = [
  {
    id: 'EMP-00101',
    name: 'Alice Johnson',
    email: 'alice.j@acme.corp',
    job_title: 'Senior Software Engineer',
    department: 'Engineering',
    country: 'United States',
    city: 'San Francisco',
    currency: 'USD',
    base_salary: 160000,
    bonus: 20000,
    salary_usd: 180000,
    employment_type: 'Full-time',
    status: 'Active',
    start_date: '2022-03-15',
    created_at: '2022-03-15T00:00:00Z',
    updated_at: '2022-03-15T00:00:00Z',
  },
  {
    id: 'EMP-00102',
    name: 'Boris Becker',
    email: 'boris.b@acme.corp',
    job_title: 'Lead Product Designer',
    department: 'Design',
    country: 'Germany',
    city: 'Berlin',
    currency: 'EUR',
    base_salary: 95000,
    bonus: 10000,
    salary_usd: 113400,
    employment_type: 'Full-time',
    status: 'On Leave',
    start_date: '2021-06-01',
    created_at: '2021-06-01T00:00:00Z',
    updated_at: '2021-06-01T00:00:00Z',
  },
];

const mockPaginatedData: PaginatedResponse<Employee> = {
  items: mockEmployees,
  total: 2,
  page: 1,
  limit: 25,
  total_pages: 1,
};

describe('EmployeeDataTable Component', () => {
  const defaultProps = {
    data: mockPaginatedData,
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    filters: { page: 1, limit: 25 },
    onFilterChange: vi.fn(),
    onResetFilters: vi.fn(),
    onEditEmployee: vi.fn(),
    onViewHistory: vi.fn(),
    onDeleteEmployee: vi.fn(),
  };

  it('renders table headers and employee records correctly', () => {
    render(<EmployeeDataTable {...defaultProps} />);

    // Assert headers
    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('Title & Dept')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Local Comp')).toBeInTheDocument();
    expect(screen.getByText('Norm Salary (USD)')).toBeInTheDocument();

    // Assert employee rows
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('alice.j@acme.corp')).toBeInTheDocument();
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Boris Becker')).toBeInTheDocument();
    expect(screen.getByText('Lead Product Designer')).toBeInTheDocument();
  });

  it('renders dual-currency values for international compensation', () => {
    render(<EmployeeDataTable {...defaultProps} />);

    // Alice: $160,000 + $20K Bonus
    expect(screen.getByText('$160,000')).toBeInTheDocument();
    expect(screen.getByText('+$20K Bonus')).toBeInTheDocument();

    // Boris: €95,000 + €10K Bonus
    expect(screen.getByText('€95,000')).toBeInTheDocument();
    expect(screen.getByText('+€10K Bonus')).toBeInTheDocument();
  });

  it('renders status badges with appropriate styles', () => {
    render(<EmployeeDataTable {...defaultProps} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('On Leave')).toBeInTheDocument();
  });

  it('triggers onFilterChange with sorting params when sort header is clicked', () => {
    const onFilterChange = vi.fn();
    render(<EmployeeDataTable {...defaultProps} onFilterChange={onFilterChange} />);

    const sortButton = screen.getByRole('button', { name: /Norm Salary \(USD\)/i });
    fireEvent.click(sortButton);

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort_by: 'salary_usd',
        sort_order: 'asc',
      })
    );
  });

  it('renders empty state when items list is empty and offers reset trigger', () => {
    const onResetFilters = vi.fn();
    render(
      <EmployeeDataTable
        {...defaultProps}
        data={{ items: [], total: 0, page: 1, limit: 25, total_pages: 0 }}
        filters={{ search: 'nonexistent-query' }}
        onResetFilters={onResetFilters}
      />
    );

    expect(screen.getByText('No employees found')).toBeInTheDocument();
    const resetBtn = screen.getByRole('button', { name: /Clear Filters/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });

  it('renders skeleton rows when isLoading is true', () => {
    render(<EmployeeDataTable {...defaultProps} isLoading={true} data={undefined} />);

    // Check absence of loaded names
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
  });
});
