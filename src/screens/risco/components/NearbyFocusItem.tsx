import { StyleSheet, Text, View } from 'react-native';

import { SG } from '@/constants/colors';
import type { RiskLevel } from '@/types';
import { formatDistance, toFiniteNumber } from '@/utils/geo';
import type { NearbyFocus } from '../hooks/useRisco';

const RISK_COLOR: Record<RiskLevel, string> = {
  ALTO: SG.danger,
  MEDIO: SG.warning,
  BAIXO: SG.success,
};

const RISK_LABEL: Record<RiskLevel, string> = {
  ALTO: 'ALTO',
  MEDIO: 'MÉDIO',
  BAIXO: 'BAIXO',
};

interface NearbyFocusItemProps {
  item: NearbyFocus;
}

export function NearbyFocusItem({ item }: NearbyFocusItemProps) {
  const risco = item.risco?.nivelRisco ?? 'BAIXO';
  const color = RISK_COLOR[risco];

  return (
    <View style={styles.row}>
      <View style={styles.distanceWrap}>
        <Text style={styles.distanceValue}>{formatDistance(item.distanciaKm)}</Text>
        <Text style={styles.distanceLabel}>distância</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.municipio} — {item.estado}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.bioma} · Risco fogo {toFiniteNumber(item.riscoFogo)?.toFixed(2) ?? '—'}
          {item.focoAtivo ? ' · ativo' : ''}
        </Text>
      </View>

      <View style={[styles.badge, { backgroundColor: `${color}26`, borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>{RISK_LABEL[risco]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SG.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SG.border,
    padding: 12,
    gap: 12,
  },
  distanceWrap: {
    width: 56,
    alignItems: 'center',
  },
  distanceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: SG.accent,
  },
  distanceLabel: {
    fontSize: 8,
    color: SG.muted,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: SG.text,
  },
  meta: {
    fontSize: 11,
    color: SG.muted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
