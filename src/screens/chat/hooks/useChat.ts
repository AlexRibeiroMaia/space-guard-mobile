import { useCallback, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  focosConsiderados?: number;
  error?: boolean;
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useChat() {
  const { token } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const append = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || sending) return;

      append({ id: newId(), role: 'user', text: content });
      setInput('');

      if (!token) {
        append({
          id: newId(),
          role: 'ai',
          text: 'Sessão sem token. Faça login novamente para usar o assistente.',
          error: true,
        });
        return;
      }

      setSending(true);
      try {
        const res = await chatService.enviar(content, token);
        append({
          id: newId(),
          role: 'ai',
          text: res.resposta,
          focosConsiderados: res.focosConsiderados,
        });
      } catch {
        append({
          id: newId(),
          role: 'ai',
          text: 'Não foi possível consultar o assistente agora. Tente novamente.',
          error: true,
        });
      } finally {
        setSending(false);
      }
    },
    [input, sending, token, append],
  );

  return { messages, input, setInput, sending, send };
}
