import { api } from './api';
import { normalizeStats } from '@/lib/utils';
import type { DashboardStats } from '@/types';

/**
 * The dashboard is served by a **single** endpoint.
 *
 * `GET /api/dashboard/stats` computes every metric with aggregation
 * pipelines server-side and returns the whole picture at once - headline
 * counters, the breakdowns that feed the charts and the most recent
 * registrations. One request instead of five keeps the dashboard fast and
 * guarantees that every widget shows data from the exact same point in time.
 */
export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    const body = await api.get('/dashboard/stats').then((res) => res.data);
    return normalizeStats(body);
  },
};
