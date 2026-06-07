import type {
  AtualizarUsuarioDTO,
  AuthUser,
  ChatResponse,
  FocoIncendioDTO,
  LocaisUsuarioResponse,
  UltimoLocalResponse,
} from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

// Microserviço de ingestão dos dados do INPE (host/porta separados do backend).
// Configure EXPO_PUBLIC_INGEST_URL com a URL COMPLETA do endpoint de coleta.
const INGEST_URL = process.env.EXPO_PUBLIC_INGEST_URL ?? 'http://localhost:8083/importar';

// ─── helpers HTTP ─────────────────────────────────────────────────

function bearerHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function authGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// GET que retorna null quando o backend responde 204 No Content (não encontrado)
async function authGetOrNull<T>(path: string, token: string): Promise<T | null> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

async function authPost<T>(path: string, data: unknown, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: bearerHeader(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function authPatch<T>(path: string, data: unknown, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: bearerHeader(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function authDel(path: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// Extrai a lista de dentro do envelope HATEOAS (_embedded.<chave>)
function unwrapEmbedded<T>(payload: any, key: string): T[] {
  return (payload?._embedded?.[key] ?? []) as T[];
}

// ─── serviços ─────────────────────────────────────────────────────

export const authService = {
  // Busca o perfil do usuário autenticado via token
  getProfile: (token: string) => authGet<AuthUser>('/auth/me', token),
};

export const focoService = {
  // Lista completa de focos (autenticado). O Dashboard deriva métricas client-side.
  listar: async (token: string): Promise<FocoIncendioDTO[]> => {
    const data = await authGet<any>('/foco-incendio', token);
    return unwrapEmbedded<FocoIncendioDTO>(data, 'focoIncendioResponseDTOList');
  },
};

export const chatService = {
  // Pergunta em linguagem natural ao assistente (Spring AI com contexto de focos).
  enviar: (message: string, token: string) =>
    authPost<ChatResponse>('/chat', { message }, token),
};

export const ingestService = {
  // Dispara a coleta de dados do INPE no microserviço (fire-and-forget, sem auth).
  // O pipeline é assíncrono (Ingestor → INPE → RabbitMQ → backend); não há
  // sinal de conclusão, então só confirmamos que a solicitação foi aceita.
  atualizar: async (): Promise<void> => {
    const res = await fetch(INGEST_URL, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};

export const localService = {
  // Persiste a localização atual do usuário no backend (autenticado).
  registrar: (idUsuario: string, latitude: number, longitude: number, token: string) =>
    authPost<unknown>('/local-usuario', { idUsuario, latitude, longitude }, token),

  // Último local registrado do usuário (null se nenhum).
  ultimoLocal: (idUsuario: string, token: string) =>
    authGetOrNull<UltimoLocalResponse>(`/local-usuario/ultimoLocal/usuario/${idUsuario}`, token),

  // Histórico completo de locais do usuário (null se nenhum).
  listar: (idUsuario: string, token: string) =>
    authGetOrNull<LocaisUsuarioResponse>(`/local-usuario/usuario/${idUsuario}`, token),

  // Remove um local pelo idLocal.
  excluir: (idLocal: string, token: string) => authDel(`/local-usuario/${idLocal}`, token),
};

export const usuarioService = {
  atualizar: (id: string, data: AtualizarUsuarioDTO, token: string) =>
    authPatch<void>(`/auth/${id}`, data, token),
  excluir: (id: string, token: string) => authDel(`/auth/${id}`, token),
};
