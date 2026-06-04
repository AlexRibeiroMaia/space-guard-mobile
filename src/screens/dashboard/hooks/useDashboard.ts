import { useCallback, useEffect, useState } from 'react';

import { dashboardService } from '@/services/api';
import type { DashboardMetrics, FocusItem } from '@/types';

const FALLBACK_METRICS: DashboardMetrics = {
  focosAtivos: 247,
  riscoAlto: 38,
  riscoMedio: 91,
  precisaoML: 94,
};

const FALLBACK_FOCUSES: FocusItem[] = [
  { id: '1', bioma: 'Amazônia', estado: 'AM', frp: 42.5, superficie: 'ÁGUA', risco: 'ALTO' },
  { id: '2', bioma: 'Cerrado', estado: 'MT', frp: 18.1, superficie: 'TERRA', risco: 'MÉDIO' },
  { id: '3', bioma: 'Mata Atlântica', estado: 'BA', frp: 5.8, superficie: 'ÁGUA', risco: 'BAIXO' },
];

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(FALLBACK_METRICS);
  const [focuses, setFocuses] = useState<FocusItem[]>(FALLBACK_FOCUSES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      dashboardService.getMetrics(),
      dashboardService.getRecentFocuses(),
    ])
      .then(([m, f]) => {
        if (!active) return;
        setMetrics(m);
        setFocuses(f);
      })
      .catch(() => { /* API indisponível — mantém dados de fallback */ })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [m, f] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getRecentFocuses(),
      ]);
      setMetrics(m);
      setFocuses(f);
    } catch {
      // mantém dados atuais
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { metrics, focuses, loading, refreshing, onRefresh };
}
