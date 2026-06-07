import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { localService } from '@/services/api';
import type { LocalUsuario } from '@/types';

export type CampoStatus = 'loading' | 'ready' | 'error';

export function useCampo() {
  const { user, token } = useAuth();

  const [status, setStatus] = useState<CampoStatus>('loading');
  const [ultimo, setUltimo] = useState<LocalUsuario | null>(null);
  const [historico, setHistorico] = useState<LocalUsuario[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id || !token) {
      setStatus('error');
      return;
    }
    const [ultimoRes, listaRes] = await Promise.all([
      localService.ultimoLocal(user.id, token),
      localService.listar(user.id, token),
    ]);
    setUltimo(ultimoRes?.local ?? null);
    // Mais recentes primeiro
    const lista = [...(listaRes?.listaLocaisUsuario ?? [])].sort((a, b) =>
      b.dataRegistro.localeCompare(a.dataRegistro),
    );
    setHistorico(lista);
    setStatus('ready');
  }, [user?.id, token]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await load();
      } catch {
        if (active) setStatus('error');
      }
    })();
    return () => { active = false; };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } catch {
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  // Registra a posição atual do dispositivo. Retorna mensagem para feedback.
  const registrarLocal = useCallback(async (): Promise<{ ok: boolean; msg: string }> => {
    if (registering) return { ok: false, msg: '' };
    if (!user?.id || !token) {
      return { ok: false, msg: 'Sessão inválida. Faça login novamente.' };
    }

    setRegistering(true);
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        return { ok: false, msg: 'Permissão de localização negada.' };
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await localService.registrar(
        user.id,
        pos.coords.latitude,
        pos.coords.longitude,
        token,
      );
      await load();
      return { ok: true, msg: 'Localização registrada com sucesso!' };
    } catch {
      return { ok: false, msg: 'Não foi possível registrar a localização.' };
    } finally {
      setRegistering(false);
    }
  }, [registering, user?.id, token, load]);

  const excluirLocal = useCallback(
    async (idLocal: string): Promise<boolean> => {
      if (!token) return false;
      try {
        await localService.excluir(idLocal, token);
        await load();
        return true;
      } catch {
        return false;
      }
    },
    [token, load],
  );

  return {
    status,
    ultimo,
    historico,
    refreshing,
    registering,
    onRefresh,
    registrarLocal,
    excluirLocal,
  };
}
