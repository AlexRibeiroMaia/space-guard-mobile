import { StyleSheet, Text, View } from 'react-native';

import { SG } from '@/constants/colors';
import type { ChatMessage } from '../hooks/useChat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAi]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAi,
          message.error && styles.bubbleError,
        ]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{message.text}</Text>

        {message.focosConsiderados != null && (
          <Text style={styles.meta}>
            🔥 {message.focosConsiderados} foco
            {message.focosConsiderados === 1 ? '' : 's'} considerado
            {message.focosConsiderados === 1 ? '' : 's'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAi: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bubbleUser: {
    backgroundColor: SG.accent,
    borderColor: SG.accent,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: SG.surface2,
    borderColor: SG.border,
    borderBottomLeftRadius: 4,
  },
  bubbleError: {
    backgroundColor: `${SG.danger}1a`,
    borderColor: SG.danger,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: SG.text,
  },
  textUser: {
    color: '#ffffff',
  },
  meta: {
    fontSize: 10,
    color: SG.muted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
