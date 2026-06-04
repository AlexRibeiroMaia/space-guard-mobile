import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';

export default function RiscoRoute() {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>SPACE GUARD</Text>
      </SafeAreaView>
      <View style={styles.body}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Modelo ML & Análise</Text>
        <Text style={styles.subtitle}>Em desenvolvimento</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SG.bg,
  },
  header: {
    backgroundColor: SG.surface,
    borderBottomWidth: 1,
    borderBottomColor: SG.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: SG.text,
    letterSpacing: 3,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: SG.text,
  },
  subtitle: {
    fontSize: 14,
    color: SG.muted,
  },
});
