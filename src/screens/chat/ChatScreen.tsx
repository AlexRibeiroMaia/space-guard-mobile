import { useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';
import { MessageBubble } from './components/MessageBubble';
import { useChat } from './hooks/useChat';

const SUGGESTIONS = [
  'Quais biomas têm mais focos ativos?',
  'Qual o nível de risco no Mato Grosso?',
  'Que cuidados devo ter perto de um foco?',
];

export function ChatScreen() {
  const { messages, input, setInput, sending, send } = useChat();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = () => listRef.current?.scrollToEnd({ animated: true });

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>SPACE GUARD</Text>
          <Text style={styles.headerSub}>Assistente IA</Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Pergunte sobre os focos de incêndio</Text>
            <Text style={styles.emptySubtitle}>
              O assistente consulta os dados reais do INPE para responder.
            </Text>

            <View style={styles.suggestions}>
              {SUGGESTIONS.map(s => (
                <Pressable
                  key={s}
                  style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                  onPress={() => send(s)}
                  disabled={sending}>
                  <Text style={styles.chipText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
            ListFooterComponent={
              sending ? (
                <View style={styles.typingRow}>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color={SG.muted} />
                    <Text style={styles.typingText}>Analisando focos…</Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Digite sua pergunta…"
            placeholderTextColor={SG.muted}
            multiline
            maxLength={500}
            editable={!sending}
            onSubmitEditing={() => send()}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              (!input.trim() || sending) && styles.sendBtnDisabled,
              pressed && input.trim() && !sending && styles.sendBtnPressed,
            ]}
            onPress={() => send()}
            disabled={!input.trim() || sending}>
            <Text style={styles.sendBtnText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SG.bg,
  },
  flex: {
    flex: 1,
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SG.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: SG.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 24,
  },
  suggestions: {
    width: '100%',
    gap: 8,
  },
  chip: {
    backgroundColor: SG.surface2,
    borderWidth: 1,
    borderColor: SG.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipPressed: {
    borderColor: SG.accent,
  },
  chipText: {
    fontSize: 13,
    color: SG.text,
  },
  listContent: {
    padding: 16,
  },
  typingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SG.surface2,
    borderWidth: 1,
    borderColor: SG.border,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 13,
    color: SG.muted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: SG.surface,
    borderTopWidth: 1,
    borderTopColor: SG.border,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: SG.surface2,
    borderWidth: 1,
    borderColor: SG.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    color: SG.text,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SG.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: SG.surface2,
    borderWidth: 1,
    borderColor: SG.border,
  },
  sendBtnPressed: {
    opacity: 0.8,
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
});
