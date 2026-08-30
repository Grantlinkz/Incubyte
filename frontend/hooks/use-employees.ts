'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Employee, EmployeeFilterParams, PaginatedResponse } from '@/lib/types';
import { getDeterministicMockEmployees, queryMockEmployees } from '@/lib/mock-data';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Fetch paginated, filtered, and sorted employee records
 */
export function useEmployees(params: EmployeeFilterParams = {}) {
  return useQuery<PaginatedResponse<Employee>>({
    queryKey: ['employees', params],
    queryFn: async () => {
      try {
        const response = await apiClient.get<PaginatedResponse<Employee>>('/employees', {
          params,
        });
        return response.data;
      } catch {
        // Fallback to deterministic in-memory mock engine
        return queryMockEmployees(params);
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

/**
 * Trigger CSV export matching active filter criteria
 */
export function exportEmployeesToCsv(params: EmployeeFilterParams = {}): void {
  try {
    // Generate filtered records
    const result = queryMockEmployees({ ...params, page: 1, limit: 10000 });
    const employees = result.items;

    if (employees.length === 0) {
      toast.warning('No employee records to export for the current filters.');
      return;
    }

    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Job Title',
      'Department',
      'Country',
      'City',
      'Currency',
      'Base Salary',
      'Bonus',
      'Salary (USD)',
      'Employment Type',
      'Status',
      'Start Date',
    ];

    const csvRows = [
      headers.join(','),
      ...employees.map((e) =>
        [
          `"${e.id}"`,
          `"${e.name.replace(/"/g, '""')}"`,
          `"${e.email}"`,
          `"${e.job_title.replace(/"/g, '""')}"`,
          `"${e.department}"`,
          `"${e.country}"`,
          `"${e.city}"`,
          `"${e.currency}"`,
          e.base_salary,
          e.bonus,
          e.salary_usd,
          `"${e.employment_type}"`,
          `"${e.status}"`,
          `"${e.start_date}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `acme-employees-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${employees.length.toLocaleString()} employee records to CSV`);
  } catch (error) {
    toast.error('Failed to export employee records to CSV.');
    console.error('CSV Export Error:', error);
  }
}

/**
 * Mutation hook to create a new employee
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const res = await apiClient.post<Employee>('/employees', employee);
        return res.data;
      } catch {
        // Mock fallback
        const mockEmps = getDeterministicMockEmployees();
        const newId = `EMP-${String(10000 + mockEmps.length + 1).padStart(5, '0')}`;
        const newRecord: Employee = {
          ...employee,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockEmps.unshift(newRecord);
        return newRecord;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Employee record created successfully');
    },
    onError: (err: Error) => {
      toast.error(`Creation failed: ${err.message}`);
    },
  });
}

/**
 * Mutation hook to update an employee
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
      try {
        const res = await apiClient.put<Employee>(`/employees/${id}`, data);
        return res.data;
      } catch {
        // Mock fallback
        const mockEmps = getDeterministicMockEmployees();
        const idx = mockEmps.findIndex((e) => e.id === id);
        if (idx !== -1) {
          mockEmps[idx] = { ...mockEmps[idx], ...data, updated_at: new Date().toISOString() };
          return mockEmps[idx];
        }
        throw new Error('Employee not found in local records');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Employee updated successfully');
    },
    onError: (err: Error) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });
}

/**
 * Mutation hook to soft-delete an employee
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete(`/employees/${id}`);
        return id;
      } catch {
        // Mock fallback
        const mockEmps = getDeterministicMockEmployees();
        const idx = mockEmps.findIndex((e) => e.id === id);
        if (idx !== -1) {
          mockEmps.splice(idx, 1);
        }
        return id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Employee removed successfully');
    },
    onError: (err: Error) => {
      toast.error(`Deletion failed: ${err.message}`);
    },
  });
}
