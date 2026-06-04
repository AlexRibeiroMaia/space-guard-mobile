import { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

const C = {
  bg: '#05080f',
  surface: '#0d1424',
  surface2: '#111d33',
  border: '#1e2d4a',
  text: '#e2e8f0',
  muted: '#64748b',
  accent: '#3b82f6',
  accent2: '#6366f1',
} as const;

// Deterministic pseudo-random in [0, 1) via sin hash
function ph(n: number, s: number): number {
  const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: ph(i, 1) * W,
  y: ph(i, 2) * H,
  size: ph(i, 3) > 0.85 ? 3 : ph(i, 3) > 0.6 ? 2 : 1.5,
  opacity: 0.15 + ph(i, 4) * 0.65,
  twinkle: ph(i, 5) > 0.87,
  duration: 700 + Math.floor(ph(i, 6) * 1500),
}));

// Individual twinkling star with reanimated opacity pulse
function TwinkleStar({
  x,
  y,
  size,
  baseOpacity,
  duration,
}: {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  duration: number;
}) {
  const opacity = useSharedValue(baseOpacity);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(baseOpacity * 0.08, { duration }),
        withTiming(baseOpacity, { duration }),
      ),
      -1,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: y,
          left: x,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#ffffff',
        },
        style,
      ]}
    />
  );
}

// Animated orbit rings with satellite dots
function OrbitDecoration() {
  const rot1 = useSharedValue(0);
  const rot2 = useSharedValue(0);

  useEffect(() => {
    rot1.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }),
      -1,
      false,
    );
    rot2.value = withRepeat(
      withTiming(-360, { duration: 16000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot1.value}deg` }],
  }));
  const style2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot2.value}deg` }],
  }));

  return (
    <View style={styles.orbit}>
      {/* Outer ring */}
      <View style={styles.orbitRingOuter} />
      {/* Outer satellite (rotates CW) */}
      <Animated.View style={[styles.orbitTrackOuter, style1]}>
        <View style={styles.satelliteOuter} />
      </Animated.View>

      {/* Inner ring */}
      <View style={styles.orbitRingInner} />
      {/* Inner satellite (rotates CCW) */}
      <Animated.View style={[styles.orbitTrackInner, style2]}>
        <View style={styles.satelliteInner} />
      </Animated.View>

      {/* Planet */}
      <View style={styles.planet}>
        <View style={styles.planetGlow} />
        <View style={styles.planetHighlight} />
      </View>
    </View>
  );
}

// Labeled input field
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

type Props = { onLogin: () => void };

export function LoginScreen({ onLogin }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const tabProgress = useSharedValue(0);
  const tabContainerW = useSharedValue(0);

  useEffect(() => {
    tabProgress.value = withTiming(tab === 'login' ? 0 : 1, { duration: 220 });
  }, [tab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabProgress.value * (tabContainerW.value / 2) }],
  }));

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Star field ─────────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {STARS.filter(s => !s.twinkle).map(s => (
          <View
            key={s.id}
            style={{
              position: 'absolute',
              top: s.y,
              left: s.x,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              backgroundColor: '#ffffff',
              opacity: s.opacity,
            }}
          />
        ))}
        {STARS.filter(s => s.twinkle).map(s => (
          <TwinkleStar
            key={s.id}
            x={s.x}
            y={s.y}
            size={s.size}
            baseOpacity={s.opacity}
            duration={s.duration}
          />
        ))}

        {/* Nebula glows */}
        <View style={[styles.nebula, { top: -130, left: -100, backgroundColor: '#1e3a8a' }]} />
        <View style={[styles.nebula, { bottom: -130, right: -100, backgroundColor: '#4c1d95' }]} />
        <View
          style={[
            styles.nebulaSmall,
            { top: H * 0.38, right: -70, backgroundColor: '#0f4c75' },
          ]}
        />
      </View>

      {/* ── Content ────────────────────────────────────────────── */}
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Orbit decoration */}
            <OrbitDecoration />

            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoEmoji}>🛡️</Text>
              </View>
              <Text style={styles.logoTitle}>SPACE GUARD</Text>
              <Text style={styles.logoSubtitle}>
                Prevenção de desastres com{'\n'}dados orbitais do INPE
              </Text>
            </View>

            {/* Status pill */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Sistema operacional · INPE Online</Text>
            </View>

            {/* Auth card */}
            <View style={styles.authCard}>
              {/* Tab switcher */}
              <View
                style={styles.tabContainer}
                onLayout={e => {
                  tabContainerW.value = e.nativeEvent.layout.width;
                }}>
                <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
                <Pressable style={styles.tabBtn} onPress={() => setTab('login')}>
                  <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>
                    ENTRAR
                  </Text>
                </Pressable>
                <Pressable style={styles.tabBtn} onPress={() => setTab('register')}>
                  <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
                    CADASTRAR
                  </Text>
                </Pressable>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {tab === 'register' && (
                  <Field label="NOME COMPLETO">
                    <TextInput
                      style={inputStyle('name')}
                      placeholder="Seu nome"
                      placeholderTextColor={C.muted}
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="words"
                    />
                  </Field>
                )}

                <Field label="E-MAIL">
                  <TextInput
                    style={inputStyle('email')}
                    placeholder="seu@email.com"
                    placeholderTextColor={C.muted}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Field>

                <Field label="SENHA">
                  <TextInput
                    style={inputStyle('password')}
                    placeholder="••••••••"
                    placeholderTextColor={C.muted}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry
                  />
                </Field>

                {tab === 'register' && (
                  <Field label="CONFIRMAR SENHA">
                    <TextInput
                      style={inputStyle('confirm')}
                      placeholder="••••••••"
                      placeholderTextColor={C.muted}
                      value={confirmPwd}
                      onChangeText={setConfirmPwd}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry
                    />
                  </Field>
                )}

                {/* CTA button */}
                <Pressable
                  style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
                  onPress={onLogin}>
                  <Text style={styles.submitBtnText}>
                    {tab === 'login' ? '→  ENTRAR' : '→  CRIAR CONTA'}
                  </Text>
                </Pressable>

                {tab === 'login' ? (
                  <Pressable style={styles.secondaryLink}>
                    <Text style={styles.secondaryLinkText}>Esqueci minha senha</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.termsText}>
                    Ao criar uma conta, você concorda com os{' '}
                    <Text style={styles.termsLink}>Termos de Uso</Text>
                    {' '}e{' '}
                    <Text style={styles.termsLink}>Política de Privacidade</Text>
                  </Text>
                )}
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              Space Guard · Dados INPE · RandomForest ML · FIAP 2024
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Orbit dimensions ────────────────────────────────────────────
const D = 120; // decoration container size
const OR = 110; // outer ring size
const IR = 74; // inner ring size
const PL = 36; // planet size

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
  },

  // ── Nebula glows ──
  nebula: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.07,
  },
  nebulaSmall: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.05,
  },

  // ── Orbit ──
  orbit: {
    width: D,
    height: D,
    marginBottom: 12,
  },
  orbitRingOuter: {
    position: 'absolute',
    top: (D - OR) / 2,
    left: (D - OR) / 2,
    width: OR,
    height: OR,
    borderRadius: OR / 2,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  orbitTrackOuter: {
    position: 'absolute',
    top: (D - OR) / 2,
    left: (D - OR) / 2,
    width: OR,
    height: OR,
  },
  satelliteOuter: {
    position: 'absolute',
    top: -4,
    left: (OR - 8) / 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  orbitRingInner: {
    position: 'absolute',
    top: (D - IR) / 2,
    left: (D - IR) / 2,
    width: IR,
    height: IR,
    borderRadius: IR / 2,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    borderStyle: 'dashed',
  },
  orbitTrackInner: {
    position: 'absolute',
    top: (D - IR) / 2,
    left: (D - IR) / 2,
    width: IR,
    height: IR,
  },
  satelliteInner: {
    position: 'absolute',
    top: -3,
    left: (IR - 6) / 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accent2,
    shadowColor: C.accent2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  planet: {
    position: 'absolute',
    top: (D - PL) / 2,
    left: (D - PL) / 2,
    width: PL,
    height: PL,
    borderRadius: PL / 2,
    backgroundColor: '#0d1f3c',
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  planetGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: PL / 2,
    backgroundColor: 'rgba(30,64,175,0.2)',
  },
  planetHighlight: {
    position: 'absolute',
    top: 7,
    left: 8,
    width: 10,
    height: 6,
    borderRadius: 5,
    backgroundColor: 'rgba(59,130,246,0.35)',
    transform: [{ rotate: '-25deg' }],
  },

  // ── Logo ──
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.45)',
    marginBottom: 4,
    // @ts-ignore — experimental RN background gradient
    experimental_backgroundImage: 'linear-gradient(145deg, #1e3a8a, #1d4ed8)',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 28,
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 5,
  },
  logoSubtitle: {
    fontSize: 11,
    color: C.muted,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 17,
  },

  // ── Status pill ──
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 24,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: C.muted,
    letterSpacing: 0.4,
  },

  // ── Auth card ──
  authCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 2,
    backgroundColor: C.accent,
    borderRadius: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.muted,
  },
  tabTextActive: {
    color: C.text,
  },

  // ── Form ──
  form: {
    padding: 20,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1.8,
  },
  input: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    color: C.text,
    fontSize: 14,
  },
  inputFocused: {
    borderColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  submitBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 2,
    // @ts-ignore — experimental RN background gradient
    experimental_backgroundImage: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  submitBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryLink: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  secondaryLinkText: {
    color: C.muted,
    fontSize: 12,
  },
  termsText: {
    color: C.muted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },
  termsLink: {
    color: C.accent,
  },

  // ── Footer ──
  footer: {
    color: C.muted,
    fontSize: 10,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
