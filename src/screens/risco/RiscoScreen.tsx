import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';
import { NearbyFocusItem } from './components/NearbyFocusItem';
import { useRisco } from './hooks/useRisco';

export function RiscoScreen() {
  const { status, location, nearby, refreshing, onRefresh, alertCount, alertRadiusKm } =
    useRisco();

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>SPACE GUARD</Text>
          <Text style={styles.headerSub}>Risco · Proximidade</Text>
        </View>
      </SafeAreaView>

      {status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={SG.accent} />
          <Text style={styles.centerText}>Obtendo sua localização…</Text>
        </View>
      ) : status === 'denied' ? (
        <View style={styles.center}>
          <Text style={styles.centerIcon}>📍</Text>
          <Text style={styles.centerTitle}>Localização desativada</Text>
          <Text style={styles.centerText}>
            Para ver os focos próximos a você, permita o acesso à localização nas
            configurações do dispositivo e puxe para atualizar.
          </Text>
        </View>
      ) : status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.centerIcon}>⚠️</Text>
          <Text style={styles.centerTitle}>Erro ao carregar</Text>
          <Text style={styles.centerText}>
            Não foi possível buscar os focos próximos. Puxe para tentar novamente.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SG.accent} />
          }>
          {/* Banner de alerta de proximidade */}
          <View
            style={[
              styles.alertCard,
              alertCount > 0 ? styles.alertCardDanger : styles.alertCardSafe,
            ]}>
            <Text style={styles.alertEmoji}>{alertCount > 0 ? '🚨' : '✅'}</Text>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>
                {alertCount > 0
                  ? `${alertCount} foco${alertCount === 1 ? '' : 's'} de risco ALTO por perto`
                  : 'Nenhum foco de risco alto por perto'}
              </Text>
              <Text style={styles.alertSubtitle}>
                Num raio de {alertRadiusKm} km da sua localização
              </Text>
            </View>
          </View>

          {location && (
            <Text style={styles.coords}>
              Sua posição: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          )}

          <Text style={styles.sectionLabel}>FOCOS MAIS PRÓXIMOS</Text>

          {nearby.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum foco encontrado na base do INPE.</Text>
          ) : (
            <View style={styles.list}>
              {nearby.map(item => (
                <NearbyFocusItem key={item.idFoco} item={item} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: SG.text,
    letterSpacing: 3,
  },
  headerSub: {
    fontSize: 11,
    color: SG.accent,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  centerIcon: {
    fontSize: 44,
  },
  centerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SG.text,
  },
  centerText: {
    fontSize: 13,
    color: SG.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  alertCardDanger: {
    backgroundColor: `${SG.danger}1a`,
    borderColor: SG.danger,
  },
  alertCardSafe: {
    backgroundColor: `${SG.success}1a`,
    borderColor: SG.success,
  },
  alertEmoji: {
    fontSize: 26,
  },
  alertInfo: {
    flex: 1,
    gap: 3,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SG.text,
  },
  alertSubtitle: {
    fontSize: 11,
    color: SG.muted,
  },
  coords: {
    fontSize: 10,
    color: SG.muted,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: SG.muted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  list: {
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: SG.muted,
  },
});
