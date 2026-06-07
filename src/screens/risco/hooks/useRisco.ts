import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { focoService, localService } from '@/services/api';
import type { FocoIncendioDTO } from '@/types';
import { haversineKm, toFiniteNumber } from '@/utils/geo';

export interface NearbyFocus extends FocoIncendioDTO {
  distanciaKm: number;
}

export interface Coords {
  latitude: number;
  longitude: number;
}

export type RiscoStatus = 'loading' | 'ready' | 'denied' | 'error';

// Focos de risco ALTO dentro deste raio disparam o alerta de proximidade
const ALERT_RADIUS_KM = 100;
const NEARBY_LIMIT = 20;

export function useRisco() {
  const { user, token } = useAuth();

  const [status, setStatus] = useState<RiscoStatus>('loading');
  const [location, setLocation] = useState<Coords | null>(null);
  const [nearby, setNearby] = useState<NearbyFocus[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    // 1) Permissão de localização
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== 'granted') {
      setStatus('denied');
      return;
    }

    // 2) Posição atual do dispositivo
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords: Coords = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
    setLocation(coords);

    // 3) Persiste no backend (best-effort — não bloqueia a tela se falhar)
    if (user?.id && token) {
      localService
        .registrar(user.id, coords.latitude, coords.longitude, token)
        .catch(() => { /* silencioso */ });
    }

    // 4) Focos + cálculo de proximidade
    if (!token) {
      setStatus('error');
      return;
    }
    const focos = await focoService.listar(token);
    const ranked = focos
      .flatMap<NearbyFocus>(f => {
        const lat = toFiniteNumber(f.latitude);
        const lon = toFiniteNumber(f.longitude);
        if (lat == null || lon == null) return []; // ignora focos sem coordenadas
        return [{
          ...f,
          latitude: lat,
          longitude: lon,
          distanciaKm: haversineKm(coords.latitude, coords.longitude, lat, lon),
        }];
      })
      .sort((a, b) => a.distanciaKm - b.distanciaKm)
      .slice(0, NEARBY_LIMIT);

    setNearby(ranked);
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

  const alertCount = nearby.filter(
    f => f.risco?.nivelRisco === 'ALTO' && f.distanciaKm <= ALERT_RADIUS_KM,
  ).length;

  return {
    status,
    location,
    nearby,
    refreshing,
    onRefresh,
    alertCount,
    alertRadiusKm: ALERT_RADIUS_KM,
  };
}
