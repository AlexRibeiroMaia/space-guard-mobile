import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const SIDEBAR_WIDTH = 280;
const DURATION = 260;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onOpenConfiguracoes: () => void;
  onLogout: () => void;
}

export function Sidebar({ visible, onClose, onOpenConfiguracoes, onLogout }: SidebarProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.value = withTiming(0, { duration: DURATION });
      backdropOpacity.value = withTiming(0.55, { duration: DURATION });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: DURATION });
      backdropOpacity.value = withTiming(0, { duration: DURATION }, () => {
        runOnJS(setMounted)(false);
      });
    }
  }, [visible]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted) return null;

  const initials = user?.nomeUsuario
    ? user.nomeUsuario.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <Animated.View style={[styles.panel, panelStyle]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>MENU</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* User section */}
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.nomeUsuario || 'Usuário'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || ''}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Menu items */}
          <View style={styles.menuList}>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={onOpenConfiguracoes}>
              <Text style={styles.menuIcon}>⚙</Text>
              <Text style={styles.menuLabel}>Configurações</Text>
              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.spacer} />

          {/* Logout */}
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
            onPress={onLogout}>
            <Text style={styles.logoutIcon}>⎋</Text>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000000',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: SG.surface,
    borderRightWidth: 1,
    borderRightColor: SG.border,
  },
  safeArea: {
    flex: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: SG.border,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: SG.muted,
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    color: SG.muted,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SG.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: SG.text,
  },
  userEmail: {
    fontSize: 11,
    color: SG.muted,
  },
  divider: {
    height: 1,
    backgroundColor: SG.border,
    marginHorizontal: 20,
  },
  menuList: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemPressed: {
    backgroundColor: SG.surface2,
  },
  menuIcon: {
    fontSize: 18,
    color: SG.muted,
    width: 22,
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: SG.text,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: SG.muted,
  },
  spacer: {
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    gap: 12,
  },
  logoutBtnPressed: {
    backgroundColor: SG.surface2,
  },
  logoutIcon: {
    fontSize: 18,
    color: SG.danger,
    width: 22,
    textAlign: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: SG.danger,
  },
});
