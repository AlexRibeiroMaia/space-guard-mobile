import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Toast } from '@/components/Toast';
import { SG } from '@/constants/colors';
import { formatDate } from '@/utils/format';
import { formatCoords } from '@/utils/geo';
import { useCampo } from './hooks/useCampo';

export function CampoScreen() {
  const {
    status,
    ultimo,
    historico,
    refreshing,
    registering,
    onRefresh,
    registrarLocal,
    excluirLocal,
  } = useCampo();
  const [toast, setToast] = useState<string | null>(null);

  async function handleRegistrar() {
    const { msg } = await registrarLocal();
    if (msg) setToast(msg);
  }

  function handleExcluir(idLocal: string) {
    Alert.alert('Remover localização', 'Deseja remover este registro de localização?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const ok = await excluirLocal(idLocal);
          setToast(ok ? 'Localização removida.' : 'Não foi possível remover.');
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>SPACE GUARD</Text>
          <Text style={styles.headerSub}>Campo · Localização</Text>
        </View>
      </SafeAreaView>

      {status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={SG.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SG.accent} />
          }>
          {status === 'error' && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>
                Não foi possível carregar suas localizações. Puxe para atualizar.
              </Text>
            </View>
          )}

          {/* Último local */}
          <Text style={styles.sectionLabel}>ÚLTIMA LOCALIZAÇÃO</Text>
          <View style={styles.lastCard}>
            <Text style={styles.lastIcon}>📍</Text>
            {ultimo ? (
              <>
                <Text style={styles.lastCoords}>
                  {formatCoords(ultimo.latitude, ultimo.longitude) ?? 'Coordenadas indisponíveis'}
                </Text>
                <Text style={styles.lastDate}>Registrado em {formatDate(ultimo.dataRegistro)}</Text>
              </>
            ) : (
              <Text style={styles.lastEmpty}>Nenhuma localização registrada ainda.</Text>
            )}
          </View>

          {/* Botão registrar */}
          <Pressable
            style={({ pressed }) => [
              styles.registerBtn,
              registering && styles.registerBtnDisabled,
              pressed && !registering && styles.registerBtnPressed,
            ]}
            onPress={handleRegistrar}
            disabled={registering}>
            {registering ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.registerBtnText}>📡  REGISTRAR MINHA LOCALIZAÇÃO</Text>
            )}
          </Pressable>

          {/* Histórico */}
          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            HISTÓRICO ({historico.length})
          </Text>
          {historico.length === 0 ? (
            <Text style={styles.emptyText}>Seus registros de localização aparecerão aqui.</Text>
          ) : (
            <View style={styles.historyList}>
              {historico.map(item => (
                <View key={item.idLocal} style={styles.historyRow}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyCoords}>
                      {formatCoords(item.latitude, item.longitude) ?? 'Coordenadas indisponíveis'}
                    </Text>
                    <Text style={styles.historyDate}>{formatDate(item.dataRegistro)}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleExcluir(item.idLocal)}
                    hitSlop={10}
                    style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

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
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
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
    marginTop: 24,
  },
  lastCard: {
    backgroundColor: SG.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SG.border,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  lastIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  lastCoords: {
    fontSize: 18,
    fontWeight: '800',
    color: SG.text,
    letterSpacing: 0.5,
  },
  lastDate: {
    fontSize: 12,
    color: SG.muted,
  },
  lastEmpty: {
    fontSize: 13,
    color: SG.muted,
    textAlign: 'center',
  },
  registerBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: SG.accent,
  },
  registerBtnPressed: {
    opacity: 0.8,
  },
  registerBtnDisabled: {
    backgroundColor: SG.surface2,
    borderWidth: 1,
    borderColor: SG.border,
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  historyList: {
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SG.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SG.border,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
    gap: 12,
  },
  historyInfo: {
    flex: 1,
    gap: 3,
  },
  historyCoords: {
    fontSize: 13,
    fontWeight: '600',
    color: SG.text,
  },
  historyDate: {
    fontSize: 11,
    color: SG.muted,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    color: SG.danger,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: SG.muted,
  },
});
