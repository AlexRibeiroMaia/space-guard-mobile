// Nível de risco — o backend usa "MEDIO" sem acento
export type RiskLevel = 'ALTO' | 'MEDIO' | 'BAIXO';
export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  nomeUsuario: string;
  email: string;
  telefone: string;
}

export interface AtualizarUsuarioDTO {
  nomeUsuario?: string;
  telefone?: string;
  email?: string;
  senha?: string;
}

// ─── Foco de incêndio (shape real do backend) ─────────────────────
export interface RiscoDTO {
  idRisco: string;
  nivelRisco: RiskLevel;
  pontuacao: number;
}

export interface FocoIncendioDTO {
  idFoco: string;
  latitude: number;
  longitude: number;
  riscoFogo: number;
  bioma: string;
  municipio: string;
  estado: string;
  focoAtivo: boolean;
  risco: RiscoDTO;
}

// ─── Localização do usuário ───────────────────────────────────────
export interface LocalUsuario {
  idLocal: string;
  latitude: number;
  longitude: number;
  dataRegistro: string; // "YYYY-MM-DD"
}

export interface UltimoLocalResponse {
  idUsuario: string;
  nomeUsuario: string;
  telefone: string;
  email: string;
  local: LocalUsuario;
}

export interface LocaisUsuarioResponse {
  idUsuario: string;
  telefone: string;
  email: string;
  listaLocaisUsuario: LocalUsuario[];
}

// ─── Chat IA ──────────────────────────────────────────────────────
export interface ChatResponse {
  resposta: string;
  focosConsiderados: number;
}

// ─── Modelos derivados para a UI do Dashboard ─────────────────────
export interface DashboardMetrics {
  focosAtivos: number;
  riscoAlto: number;
  riscoMedio: number;
  precisaoML: number | null; // não disponível via API ainda
}

export interface FocusItem {
  id: string;
  bioma: string;
  municipio: string;
  estado: string;
  riscoFogo: number;
  ativo: boolean;
  risco: RiskLevel;
}
