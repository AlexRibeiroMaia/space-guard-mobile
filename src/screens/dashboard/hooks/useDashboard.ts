import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { focoService, ingestService } from '@/services/api';
import type { DashboardMetrics, FocoIncendioDTO, FocusItem } from '@/types';

const EMPTY_METRICS: DashboardMetrics = {
  focosAtivos: 0,
  riscoAlto: 0,
  riscoMedio: 0,
  precisaoML: null,
};

const COOLDOWN_SECONDS = 30;
const RECENT_LIMIT = 10;

// FocoIncendioDTO (backend) → FocusItem (UI)
function toFocusItem(f: FocoIncendioDTO): FocusItem {
  return {
    id: f.idFoco,
    bioma: f.bioma,
    municipio: f.municipio,
    estado: f.estado,
    riscoFogo: f.riscoFogo,
    ativo: f.focoAtivo,
    risco: f.risco?.nivelRisco ?? 'BAIXO',
  };
}

function deriveMetrics(focos: FocoIncendioDTO[]): DashboardMetrics {
  return {
    focosAtivos: focos.filter(f => f.focoAtivo).length,
    riscoAlto: focos.filter(f => f.risco?.nivelRisco === 'ALTO').length,
    riscoMedio: focos.filter(f => f.risco?.nivelRisco === 'MEDIO').length,
    precisaoML: null, // não exposto pela API
  };
}

// Sem dataDeteccao no response DTO: prioriza focos ativos e maior risco de fogo.
function deriveRecent(focos: FocoIncendioDTO[]): FocusItem[] {
  return [...focos]
    .sort((a, b) => {
      if (a.focoAtivo !== b.focoAtivo) return a.focoAtivo ? -1 : 1;
      return b.riscoFogo - a.riscoFogo;
    })
    .slice(0, RECENT_LIMIT)
    .map(toFocusItem);
}

export function useDashboard() {
  const { token } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS);
  const [focuses, setFocuses] = useState<FocusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ingesting, setIngesting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFocos = useCallback(async () => {
    if (!token) {
      setError('Sessão sem token. Faça login novamente.');
      return;
    }
    const focos = await focoService.listar(token);
    setMetrics(deriveMetrics(focos));
    setFocuses(deriveRecent(focos));
    setError(null);
  }, [token]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await fetchFocos();
      } catch {
        if (active) setError('Não foi possível carregar os focos do INPE.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [fetchFocos]);

  // Limpa o intervalo do cooldown ao desmontar
  useEffect(() => () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFocos();
    } catch {
      setError('Não foi possível atualizar os focos do INPE.');
    } finally {
      setRefreshing(false);
    }
  }, [fetchFocos]);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Dispara a coleta no microserviço (fire-and-forget). Retorna true em sucesso.
  const atualizarDados = useCallback(async (): Promise<boolean> => {
    if (ingesting || cooldown > 0) return false;
    setIngesting(true);
    try {
      await ingestService.atualizar();
      startCooldown();
      return true;
    } catch (e) {
      console.warn('[ingest] falha ao importar dados do INPE:', e);
      return false;
    } finally {
      setIngesting(false);
    }
  }, [ingesting, cooldown, startCooldown]);

  return {
    metrics,
    focuses,
    loading,
    refreshing,
    error,
    onRefresh,
    ingesting,
    cooldown,
    atualizarDados,
  };
}
