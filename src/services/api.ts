import type { AtualizarUsuarioDTO, AuthUser, DashboardMetrics, FocusItem } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

// ─── helpers HTTP ─────────────────────────────────────────────────

function bearerHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

async function authGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
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

// ─── serviços ─────────────────────────────────────────────────────

export const authService = {
  // Busca o perfil do usuário autenticado via token
  getProfile: (token: string) => authGet<AuthUser>('/auth/me', token),
};

export const dashboardService = {
  getMetrics: () => get<DashboardMetrics>('/metricas'),
  getRecentFocuses: () => get<FocusItem[]>('/focos/recentes'),
};

export const usuarioService = {
  atualizar: (id: string, data: AtualizarUsuarioDTO, token: string) =>
    authPatch<void>(`/auth/${id}`, data, token),
  excluir: (id: string, token: string) => authDel(`/auth/${id}`, token),
};
