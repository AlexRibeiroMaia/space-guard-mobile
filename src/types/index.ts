export type RiskLevel = 'ALTO' | 'MÉDIO' | 'BAIXO';
export type SurfaceType = 'ÁGUA' | 'TERRA';

export interface DashboardMetrics {
  focosAtivos: number;
  riscoAlto: number;
  riscoMedio: number;
  precisaoML: number;
}

export interface FocusItem {
  id: string;
  bioma: string;
  estado: string;
  frp: number;
  superficie: SurfaceType;
  risco: RiskLevel;
}
