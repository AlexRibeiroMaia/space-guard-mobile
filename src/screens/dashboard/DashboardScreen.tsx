import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppMenu } from '@/components/AppMenu';
import { Toast } from '@/components/Toast';
import { SG } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { FocusListItem } from './components/FocusListItem';
import { MetricCard } from './components/MetricCard';
import { useDashboard } from './hooks/useDashboard';

export function DashboardScreen() {
  const {
    metrics,
    focuses,
    loading,
    refreshing,
    error,
    onRefresh,
    ingesting,
    cooldown,
    atualizarDados,
  } = useDashboard();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const onCooldown = cooldown > 0;
  const btnDisabled = ingesting || onCooldown;

  async function handleAtualizar() {
    const ok = await atualizarDados();
    setToast(
      ok
        ? 'Atualização solicitada! Use o pull-to-refresh em alguns instantes.'
        : 'Não foi possível solicitar a atualização. Tente novamente.',
    );
  }

  const btnLabel = ingesting
    ? 'SOLICITANDO…'
    : onCooldown
      ? `AGUARDE ${cooldown}s`
      : '↻  ATUALIZAR DADOS INPE';

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerBrand}>
            <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
              <Text style={styles.headerMenu}>≡</Text>
            </Pressable>
            <Text style={styles.headerTitle}>SPACE GUARD</Text>
          </View>
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={SG.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={SG.accent}
            />
          }>
          <Pressable
            style={({ pressed }) => [
              styles.updateBtn,
              btnDisabled && styles.updateBtnDisabled,
              pressed && !btnDisabled && styles.updateBtnPressed,
            ]}
            onPress={handleAtualizar}
            disabled={btnDisabled}>
            {ingesting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.updateBtnText}>{btnLabel}</Text>
            )}
          </Pressable>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>MÉTRICAS EM TEMPO REAL</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricsRow}>
              <MetricCard
                label="FOCOS ATIVOS"
                value={String(metrics.focosAtivos)}
                description="detectados INPE"
                color={SG.accent}
              />
              <MetricCard
                label="RISCO ALTO"
                value={String(metrics.riscoAlto)}
                description="atenção imediata"
                color={SG.danger}
              />
            </View>
            <View style={styles.metricsRow}>
              <MetricCard
                label="RISCO MÉDIO"
                value={String(metrics.riscoMedio)}
                description="monitoramento ativo"
                color={SG.warning}
              />
              <MetricCard
                label="PRECISÃO ML"
                value={metrics.precisaoML != null ? `${metrics.precisaoML}%` : '–'}
                description="RandomForest"
                color={SG.success}
              />
            </View>
          </View>

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>FOCOS RECENTES</Text>

          <View style={styles.focusList}>
            {focuses.map(item => (
              <FocusListItem key={item.id} item={item} />
            ))}
          </View>
        </ScrollView>
      )}

      <AppMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={logout}
      />

      <Toast message={toast} onHide={() => setToast(null)} />
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerMenu: {
    fontSize: 22,
    color: SG.text,
    lineHeight: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: SG.text,
    letterSpacing: 3,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: SG.success,
    shadowColor: SG.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: SG.success,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  updateBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: SG.accent,
    marginBottom: 16,
  },
  updateBtnPressed: {
    opacity: 0.8,
  },
  updateBtnDisabled: {
    backgroundColor: SG.surface2,
    borderWidth: 1,
    borderColor: SG.border,
  },
  updateBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  errorBanner: {
    backgroundColor: `${SG.danger}1a`,
    borderWidth: 1,
    borderColor: SG.danger,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: SG.danger,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: SG.muted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  sectionLabelSpaced: {
    marginTop: 20,
  },
  metricsGrid: {
    gap: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  focusList: {
    gap: 8,
  },
});
