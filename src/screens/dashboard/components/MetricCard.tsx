import { StyleSheet, Text, View } from 'react-native';

import { SG } from '@/constants/colors';

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  color: string;
}

export function MetricCard({ label, value, description, color }: MetricCardProps) {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: SG.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SG.border,
    borderTopWidth: 2,
    padding: 12,
    gap: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: SG.muted,
    letterSpacing: 1.5,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 10,
    color: SG.muted,
    marginTop: 2,
  },
});
