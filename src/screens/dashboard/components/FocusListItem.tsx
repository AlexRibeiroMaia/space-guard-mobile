import { StyleSheet, Text, View } from 'react-native';

import { SG } from '@/constants/colors';
import type { FocusItem, RiskLevel } from '@/types';
import { toFiniteNumber } from '@/utils/geo';

const RISK_COLOR: Record<RiskLevel, string> = {
  ALTO: '#ef4444',
  MEDIO: '#f59e0b',
  BAIXO: '#10b981',
};

const RISK_LABEL: Record<RiskLevel, string> = {
  ALTO: 'ALTO',
  MEDIO: 'MÉDIO',
  BAIXO: 'BAIXO',
};

const BIOME_EMOJI: Record<string, string> = {
  Amazônia: '🌿',
  Cerrado: '🌾',
  'Mata Atlântica': '🌲',
  Pantanal: '🦜',
  Caatinga: '🌵',
  Pampa: '🌱',
};

function getBiomeEmoji(bioma: string): string {
  const match = Object.entries(BIOME_EMOJI).find(([key]) => bioma.startsWith(key));
  return match ? match[1] : '🔥';
}

interface FocusListItemProps {
  item: FocusItem;
}

export function FocusListItem({ item }: FocusListItemProps) {
  const riskColor = RISK_COLOR[item.risco];
  const emoji = getBiomeEmoji(item.bioma);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>
          {item.municipio} — {item.estado}
        </Text>
        <Text style={styles.meta}>
          {item.bioma} · Risco fogo {toFiniteNumber(item.riscoFogo)?.toFixed(2) ?? '—'}
          {item.ativo ? ' · ativo' : ''}
        </Text>
      </View>

      <View style={[styles.badge, { backgroundColor: `${riskColor}26`, borderColor: riskColor }]}>
        <Text style={[styles.badgeText, { color: riskColor }]}>{RISK_LABEL[item.risco]}</Text>
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
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: SG.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
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
