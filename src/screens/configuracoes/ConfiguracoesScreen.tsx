import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';

interface ConfiguracoesScreenProps {
  visible: boolean;
  onClose: () => void;
  onOpenPerfil: () => void;
}

export function ConfiguracoesScreen({ visible, onClose, onOpenPerfil }: ConfiguracoesScreenProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable onPress={onClose} hitSlop={12} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ Voltar</Text>
            </Pressable>
            <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
            <View style={styles.backBtn} />
          </View>
        </SafeAreaView>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>CONTA</Text>

          <View style={styles.menuCard}>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={onOpenPerfil}>
              <View style={styles.menuItemIconWrap}>
                <Text style={styles.menuItemIcon}>👤</Text>
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemTitle}>Usuário</Text>
                <Text style={styles.menuItemSubtitle}>Editar dados e excluir conta</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
  backBtn: {
    minWidth: 70,
  },
  backBtnText: {
    fontSize: 14,
    color: SG.accent,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: SG.text,
    letterSpacing: 2,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: SG.muted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: SG.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SG.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemPressed: {
    backgroundColor: SG.surface2,
  },
  menuItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: SG.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemInfo: {
    flex: 1,
    gap: 3,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SG.text,
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: SG.muted,
  },
  menuArrow: {
    fontSize: 20,
    color: SG.muted,
  },
});
