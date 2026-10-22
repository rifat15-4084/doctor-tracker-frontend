'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => ['dashboard', 'stats'] as const,
};

/**
 * The whole dashboard comes from one endpoint (`GET /api/dashboard/stats`),
 * so a single query powers every widget: counters, charts and the list of
 * the most recent registrations.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardService.stats,
    staleTime: 60_000,
  });
}
