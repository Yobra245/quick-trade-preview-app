
export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  changePercentage24h: number;
  volume24h: number;
  marketCap: number;
}

export interface TradeSignal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  timestamp: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  strategy: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'STOPPED';
  profitLoss?: number;
  indicators: {
    name: string;
    value: string;
    bullish: boolean;
  }[];
}

export interface TradeExecution {
  id: string;
  signalId: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  entryTime: string;
  quantity: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'FAILED';
  exitPrice?: number;
  exitTime?: string;
  profitLoss?: number;
  profitLossPercentage?: number;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageProfit: number;
  averageLoss: number;
  totalProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AIInsight {
  id: string;
  symbol: string;
  summary: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  factors: string[];
  generatedAt: string;
  timeframe: string;
}
