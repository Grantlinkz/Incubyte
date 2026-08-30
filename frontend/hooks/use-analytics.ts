'use client';

import { useQuery } from '@tanstack/react-query';
import type { AnalyticsSummary, CountryAnalytics, Currency, DepartmentAnalytics } from '@/lib/types';
import {
  getMockAnalyticsSummary,
  getMockCountryAnalytics,
  getMockDepartmentAnalytics,
} from '@/lib/mock-data';
import { apiClient } from '@/lib/api-client';

/**
 * Fetch top-level macro compensation KPIs
 */
export function useAnalyticsSummary(currency: Currency = 'USD') {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics', 'summary', currency],
    queryFn: async () => {
      try {
        const response = await apiClient.get<AnalyticsSummary>('/analytics/summary', {
          params: { currency },
        });
        return response.data;
      } catch {
        // Graceful fallback to deterministic mock calculation engine
        return getMockAnalyticsSummary(currency);
      }
    },
    staleTime: 60_000,
  });
}

/**
 * Fetch departmental spend and headcount analytics
 */
export function useDepartmentAnalytics(currency: Currency = 'USD') {
  return useQuery<DepartmentAnalytics[]>({
    queryKey: ['analytics', 'department', currency],
    queryFn: async () => {
      try {
        const response = await apiClient.get<DepartmentAnalytics[]>('/analytics/by-department', {
          params: { currency },
        });
        return response.data;
      } catch {
        // Graceful fallback to deterministic mock calculation engine
        return getMockDepartmentAnalytics(currency);
      }
    },
    staleTime: 60_000,
  });
}

/**
 * Fetch geographic country spend and headcount analytics
 */
export function useCountryAnalytics(currency: Currency = 'USD') {
  return useQuery<CountryAnalytics[]>({
    queryKey: ['analytics', 'country', currency],
    queryFn: async () => {
      try {
        const response = await apiClient.get<CountryAnalytics[]>('/analytics/by-country', {
          params: { currency },
        });
        return response.data;
      } catch {
        // Graceful fallback to deterministic mock calculation engine
        return getMockCountryAnalytics(currency);
      }
    },
    staleTime: 60_000,
  });
}
