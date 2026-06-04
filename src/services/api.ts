import type { DashboardMetrics, FocusItem } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export const dashboardService = {
  getMetrics: () => get<DashboardMetrics>('/metricas'),
  getRecentFocuses: () => get<FocusItem[]>('/focos/recentes'),
};
