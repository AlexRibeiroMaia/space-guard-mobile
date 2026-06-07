import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { usuarioService } from '@/services/api';
import { formatPhone } from '@/utils/format';

// ─── tipos internos ───────────────────────────────────────────────
type MenuView = 'menu' | 'configuracoes' | 'perfil';

const SIDEBAR_W = 280;
const ANIM_MS = 260;

// ─── AppMenu ──────────────────────────────────────────────────────
interface AppMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function AppMenu({ visible, onClose, onLogout }: AppMenuProps) {
  const [view, setView] = useState<MenuView>('menu');
  const [mounted, setMounted] = useState(false);

  const translateX = useSharedValue(-SIDEBAR_W);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setView('menu');
      setMounted(true);
      translateX.value = withTiming(0, { duration: ANIM_MS });
      backdropOpacity.value = withTiming(0.55, { duration: ANIM_MS });
    } else {
      translateX.value = withTiming(-SIDEBAR_W, { duration: ANIM_MS });
      backdropOpacity.value = withTiming(0, { duration: ANIM_MS }, () => {
        runOnJS(setMounted)(false);
        runOnJS(setView)('menu');
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

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>

      {view === 'menu' && (
        <>
          {/* Backdrop — pressável para fechar */}
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </Animated.View>

          {/* Painel lateral */}
          <Animated.View style={[styles.panel, panelStyle]}>
            <MenuPanel
              onOpenConfiguracoes={() => setView('configuracoes')}
              onLogout={onLogout}
              onClose={onClose}
            />
          </Animated.View>
        </>
      )}

      {view === 'configuracoes' && (
        <ConfiguracoesView
          onBack={() => setView('menu')}
          onOpenPerfil={() => setView('perfil')}
        />
      )}

      {view === 'perfil' && (
        <PerfilView
          onBack={() => setView('configuracoes')}
          onLogout={() => { onClose(); onLogout(); }}
        />
      )}
    </Modal>
  );
}

// ─── MenuPanel ────────────────────────────────────────────────────
interface MenuPanelProps {
  onOpenConfiguracoes: () => void;
  onLogout: () => void;
  onClose: () => void;
}

function MenuPanel({ onOpenConfiguracoes, onLogout, onClose }: MenuPanelProps) {
  const { user } = useAuth();

  const initials = user?.nomeUsuario
    ? user.nomeUsuario.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>MENU</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

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

      <Pressable
        style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
        onPress={onOpenConfiguracoes}>
        <Text style={styles.menuItemIcon}>⚙</Text>
        <Text style={styles.menuItemLabel}>Configurações</Text>
        <Text style={styles.menuArrow}>›</Text>
      </Pressable>

      <View style={{ flex: 1 }} />

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
        onPress={onLogout}>
        <Text style={styles.logoutIcon}>⎋</Text>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// ─── ConfiguracoesView ────────────────────────────────────────────
interface ConfiguracoesViewProps {
  onBack: () => void;
  onOpenPerfil: () => void;
}

function ConfiguracoesView({ onBack, onOpenPerfil }: ConfiguracoesViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.fullScreen}>
      <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
        <View style={styles.screenHeaderRow}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </Pressable>
          <Text style={styles.screenTitle}>CONFIGURAÇÕES</Text>
          <View style={styles.headerSide} />
        </View>
      </View>

      <View style={styles.screenBody}>
        <Text style={styles.sectionLabel}>CONTA</Text>
        <View style={styles.listCard}>
          <Pressable
            style={({ pressed }) => [styles.listCardItem, pressed && styles.menuItemPressed]}
            onPress={onOpenPerfil}>
            <View style={styles.listCardIconWrap}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.listCardTitle}>Usuário</Text>
              <Text style={styles.listCardSubtitle}>Editar dados e excluir conta</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── PerfilView ───────────────────────────────────────────────────
interface PerfilViewProps {
  onBack: () => void;
  onLogout: () => void;
}

function PerfilView({ onBack, onLogout }: PerfilViewProps) {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState(user?.nomeUsuario ?? '');
  const [telefone, setTelefone] = useState(
    user?.telefone ? formatPhone(user.telefone) : '',
  );
  const [email, setEmail] = useState(user?.email ?? '');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  function validarSessao(): boolean {
    if (!user?.id || !token) {
      Alert.alert('Sessão inválida', 'Não foi possível identificar sua conta. Faça login novamente.');
      return false;
    }
    return true;
  }

  async function handleSalvar() {
    if (!validarSessao()) return;
    setLoading(true);
    try {
      const payload: Record<string, string> = {};
      if (nome.trim()) payload.nomeUsuario = nome.trim();
      if (telefone) payload.telefone = telefone.replace(/\D/g, '');
      if (email.trim()) payload.email = email.trim();
      if (senha) payload.senha = senha;

      await usuarioService.atualizar(user!.id, payload, token!);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso.');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível atualizar os dados.');
    } finally {
      setLoading(false);
    }
  }

  function handleExcluir() {
    if (!validarSessao()) return;
    Alert.alert(
      'Excluir Conta',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await usuarioService.excluir(user!.id, token!);
              onLogout();
            } catch (e: any) {
              setLoading(false);
              Alert.alert('Erro', e?.message ?? 'Não foi possível excluir a conta.');
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.fullScreen}>
      <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
        <View style={styles.screenHeaderRow}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </Pressable>
          <Text style={styles.screenTitle}>PERFIL</Text>
          <View style={styles.headerSide} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.perfilScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Text style={styles.sectionLabel}>DADOS DA CONTA</Text>

          <View style={styles.formCard}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>NOME COMPLETO</Text>
              <TextInput
                style={inputStyle('nome')}
                value={nome}
                onChangeText={setNome}
                onFocus={() => setFocusedField('nome')}
                onBlur={() => setFocusedField(null)}
                placeholder="Seu nome"
                placeholderTextColor={SG.muted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formDivider} />

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>TELEFONE</Text>
              <TextInput
                style={inputStyle('telefone')}
                value={telefone}
                onChangeText={v => setTelefone(formatPhone(v))}
                onFocus={() => setFocusedField('telefone')}
                onBlur={() => setFocusedField(null)}
                placeholder="(11) 99999-9999"
                placeholderTextColor={SG.muted}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.formDivider} />

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>E-MAIL</Text>
              <TextInput
                style={inputStyle('email')}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="seu@email.com"
                placeholderTextColor={SG.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.formDivider} />

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>NOVA SENHA</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[inputStyle('senha'), styles.inputWithEye]}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setFocusedField('senha')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Deixe em branco para manter"
                  placeholderTextColor={SG.muted}
                  secureTextEntry={!showSenha}
                />
                <Pressable
                  onPress={() => setShowSenha(v => !v)}
                  style={styles.eyeBtn}
                  hitSlop={8}>
                  <Text style={styles.eyeText}>{showSenha ? 'OCULTAR' : 'VER'}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
            onPress={handleSalvar}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>SALVAR ALTERAÇÕES</Text>
            )}
          </Pressable>

          <View style={styles.deleteSection}>
            <View style={styles.formDivider} />
            <Text style={styles.deleteWarning}>
              Ao excluir sua conta, todos os dados serão removidos permanentemente.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
              onPress={handleExcluir}
              disabled={loading}>
              <Text style={styles.deleteBtnText}>CONFIRMAR EXCLUSÃO DA CONTA</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Sidebar
  backdrop: {
    backgroundColor: '#000000',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_W,
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
  closeText: {
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
  menuItemIcon: {
    fontSize: 18,
    color: SG.muted,
    width: 22,
    textAlign: 'center',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 14,
    color: SG.text,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: SG.muted,
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

  // Full-screen views
  fullScreen: {
    flex: 1,
    backgroundColor: SG.bg,
  },
  screenHeader: {
    backgroundColor: SG.surface,
    borderBottomWidth: 1,
    borderBottomColor: SG.border,
  },
  screenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: {
    minWidth: 70,
  },
  backText: {
    fontSize: 14,
    color: SG.accent,
    fontWeight: '500',
  },
  screenTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: SG.text,
    letterSpacing: 2,
  },
  screenBody: {
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
  listCard: {
    backgroundColor: SG.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SG.border,
    overflow: 'hidden',
  },
  listCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  listCardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: SG.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SG.text,
  },
  listCardSubtitle: {
    fontSize: 11,
    color: SG.muted,
  },

  // Perfil form
  perfilScroll: {
    padding: 16,
    paddingBottom: 48,
    gap: 16,
  },
  formCard: {
    backgroundColor: SG.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SG.border,
    overflow: 'hidden',
  },
  formField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: SG.muted,
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  formDivider: {
    height: 1,
    backgroundColor: SG.border,
    width: '100%',
  },
  input: {
    backgroundColor: SG.surface2,
    borderWidth: 1,
    borderColor: SG.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    color: SG.text,
    fontSize: 14,
  },
  inputFocused: {
    borderColor: SG.accent,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputWithEye: {
    paddingRight: 72,
  },
  eyeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: SG.accent,
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: SG.accent,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  deleteSection: {
    alignItems: 'center',
    gap: 14,
  },
  deleteWarning: {
    fontSize: 12,
    color: SG.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  deleteBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: SG.danger,
    width: '100%',
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
