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
import { SafeAreaView } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { usuarioService } from '@/services/api';
import { formatPhone } from '@/utils/format';

interface PerfilScreenProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function PerfilScreen({ visible, onClose, onLogout }: PerfilScreenProps) {
  const { user, token } = useAuth();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setNome(user?.nomeUsuario ?? '');
      setTelefone(user?.telefone ? formatPhone(user.telefone) : '');
      setEmail(user?.email ?? '');
      setSenha('');
      setShowSenha(false);
    }
  }, [visible, user]);

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  async function handleSalvar() {
    if (!user?.id) {
      Alert.alert('Erro', 'ID do usuário não encontrado. Faça login novamente.');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, string> = {};
      if (nome.trim()) payload.nomeUsuario = nome.trim();
      if (telefone) payload.telefone = telefone.replace(/\D/g, '');
      if (email.trim()) payload.email = email.trim();
      if (senha) payload.senha = senha;

      await usuarioService.atualizar(user.id, payload, token ?? '');
      Alert.alert('Sucesso', 'Dados atualizados com sucesso.');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível atualizar os dados.');
    } finally {
      setLoading(false);
    }
  }

  function handleExcluir() {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
              await usuarioService.excluir(user.id, token ?? '');
              onClose();
              onLogout();
            } catch (e: any) {
              Alert.alert('Erro', e?.message ?? 'Não foi possível excluir a conta.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }

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
            <Text style={styles.headerTitle}>PERFIL</Text>
            <View style={styles.backBtn} />
          </View>
        </SafeAreaView>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Form */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DADOS DA CONTA</Text>
              <View style={styles.formCard}>
                {/* Nome */}
                <View style={styles.field}>
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

                <View style={styles.fieldDivider} />

                {/* Telefone */}
                <View style={styles.field}>
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

                <View style={styles.fieldDivider} />

                {/* E-mail */}
                <View style={styles.field}>
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

                <View style={styles.fieldDivider} />

                {/* Senha */}
                <View style={styles.field}>
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
            </View>

            {/* Save button */}
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
              onPress={handleSalvar}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>SALVAR ALTERAÇÕES</Text>
              )}
            </Pressable>

            {/* Delete section */}
            <View style={styles.deleteSection}>
              <View style={styles.deleteDivider} />
              <Text style={styles.deleteWarning}>
                Ao excluir sua conta, todos os seus dados serão removidos permanentemente.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
                onPress={handleExcluir}
                disabled={loading}>
                <Text style={styles.deleteBtnText}>CONFIRMAR EXCLUSÃO DA CONTA</Text>
              </Pressable>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
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
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: SG.muted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  formCard: {
    backgroundColor: SG.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SG.border,
    overflow: 'hidden',
  },
  field: {
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
  fieldDivider: {
    height: 1,
    backgroundColor: SG.border,
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
    marginBottom: 32,
  },
  saveBtnPressed: {
    opacity: 0.8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  deleteSection: {
    alignItems: 'center',
    gap: 16,
  },
  deleteDivider: {
    height: 1,
    backgroundColor: SG.border,
    width: '100%',
  },
  deleteWarning: {
    fontSize: 12,
    color: SG.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  deleteBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: SG.danger,
    width: '100%',
  },
  deleteBtnPressed: {
    opacity: 0.8,
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
