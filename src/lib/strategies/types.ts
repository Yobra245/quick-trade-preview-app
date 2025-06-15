
export interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, StrategyParameter>;
  timeframes: string[];
  assets: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'MOMENTUM' | 'VOLATILITY' | 'AI_ML';
}

export interface StrategyParameter {
  name: string;
  type: 'number' | 'boolean' | 'select';
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description: string;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number; // 0-100
}

export interface MarketData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StrategySignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  strength: number; // 0-100
  confidence: number; // 0-100
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  indicators: TechnicalIndicator[];
  reasoning: string[];
}

export interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgTrade: number;
  volatility: number;
  calmarRatio: number;
  sortinoRatio: number;
  trades: TradeResult[];
  equity: { date: string; value: number }[];
}

export interface TradeResult {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  type: 'BUY' | 'SELL';
  strategy: string;
}
