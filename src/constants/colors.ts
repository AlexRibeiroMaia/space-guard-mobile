// Space Guard — paleta de cores centralizada usada em todas as telas
export const SG = {
  bg: '#05080f',
  surface: '#0d1424',
  surface2: '#111d33',
  border: '#1e2d4a',
  text: '#e2e8f0',
  muted: '#64748b',
  accent: '#3b82f6',
  accent2: '#6366f1',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
} as const;

export type SgColor = keyof typeof SG;
