import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from '@/hooks/use-employees';
import { createTestWrapper, createTestQueryClient } from '../test-utils';
import type { Employee } from '@/lib/types';
import { toast } from 'sonner';

// Mock sonner toast to verify feedback
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

const mockApiEmployee: Employee = {
  id: 'EMP-99999',
  name: 'Devon Miles',
  email: 'd.miles@acme.corp',
  job_title: 'Operations Director',
  department: 'Operations',
  country: 'United Kingdom',
  city: 'London',
  currency: 'GBP',
  base_salary: 110000,
  bonus: 15000,
  salary_usd: 140800,
  employment_type: 'Full-time',
  status: 'Active',
  start_date: '2023-01-01',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const server = setupServer(
  http.post('*/employees', async ({ request }) => {
    const body = (await request.json()) as Partial<Employee>;
    return HttpResponse.json({
      ...mockApiEmployee,
      ...body,
      id: 'EMP-99999',
    });
  }),
  http.put('*/employees/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Employee>;
    return HttpResponse.json({
      ...mockApiEmployee,
      ...body,
      id: params.id,
    });
  }),
  http.delete('*/employees/:id', () => {
    return HttpResponse.json({ success: true });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe('Optimistic & Server Mutations with React Query & MSW', () => {
  it('successfully creates an employee and invalidates queries with success toast', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = createTestWrapper(queryClient);

    const { result } = renderHook(() => useCreateEmployee(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Devon Miles',
        email: 'd.miles@acme.corp',
        job_title: 'Operations Director',
        department: 'Operations',
        country: 'United Kingdom',
        city: 'London',
        currency: 'GBP',
        base_salary: 110000,
        bonus: 15000,
        salary_usd: 140800,
        employment_type: 'Full-time',
        status: 'Active',
        start_date: '2023-01-01',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['employees'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['analytics'] });
      expect(toast.success).toHaveBeenCalledWith('Employee record created successfully');
    });
  });

  it('successfully updates an employee record and invalidates salary history cache', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = createTestWrapper(queryClient);

    const { result } = renderHook(() => useUpdateEmployee(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: 'EMP-99999',
        data: { base_salary: 125000 },
        previousSalary: 110000,
        reason: 'Market Adjustment',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['salary-history', 'EMP-99999'],
      });
      expect(toast.success).toHaveBeenCalledWith('Employee updated successfully');
    });
  });

  it('successfully deletes an employee and handles cache invalidation', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = createTestWrapper(queryClient);

    const { result } = renderHook(() => useDeleteEmployee(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('EMP-99999');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['employees'] });
      expect(toast.success).toHaveBeenCalledWith('Employee removed successfully');
    });
  });
});
