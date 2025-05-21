
import { CryptoAsset, TradeSignal, TradeExecution, PerformanceMetrics, AIInsight } from './types';

// Market Data
export const mockAssets: CryptoAsset[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC/USDT',
    price: 51239.75,
    change24h: 1258.42,
    changePercentage24h: 2.52,
    volume24h: 32567890000,
    marketCap: 976543210000,
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH/USDT',
    price: 2853.18,
    change24h: 123.45,
    changePercentage24h: 4.52,
    volume24h: 15789023000,
    marketCap: 345678912000,
  },
  {
    id: '3',
    name: 'Binance Coin',
    symbol: 'BNB/USDT',
    price: 587.25,
    change24h: -12.34,
    changePercentage24h: -2.06,
    volume24h: 3245678900,
    marketCap: 89765432100,
  },
  {
    id: '4',
    name: 'Solana',
    symbol: 'SOL/USDT',
    price: 147.82,
    change24h: 5.25,
    changePercentage24h: 3.68,
    volume24h: 4567890123,
    marketCap: 65432198700,
  },
  {
    id: '5',
    name: 'Ripple',
    symbol: 'XRP/USDT',
    price: 0.5275,
    change24h: -0.0325,
    changePercentage24h: -5.8,
    volume24h: 2345678901,
    marketCap: 54321098700,
  }
];

// Trade Signals
export const mockSignals: TradeSignal[] = [
  {
    id: '1',
    symbol: 'BTC/USDT',
    direction: 'BUY',
    entryPrice: 51200,
    targetPrice: 52500,
    stopLoss: 50800,
    confidence: 87,
    timestamp: new Date().toISOString(),
    timeframe: '1h',
    strategy: 'Momentum Breakout',
    status: 'ACTIVE',
    indicators: [
      { name: 'RSI', value: '38', bullish: true },
      { name: 'MACD', value: 'Crossing', bullish: true },
      { name: 'MA Cross', value: 'Bullish', bullish: true }
    ]
  },
  {
    id: '2',
    symbol: 'ETH/USDT',
    direction: 'BUY',
    entryPrice: 2850,
    targetPrice: 2950,
    stopLoss: 2780,
    confidence: 76,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    timeframe: '4h',
    strategy: 'Support Bounce',
    status: 'PENDING',
    indicators: [
      { name: 'RSI', value: '42', bullish: true },
      { name: 'Stochastic', value: 'Oversold', bullish: true },
      { name: 'Bollinger', value: 'Lower Band Touch', bullish: true }
    ]
  },
  {
    id: '3',
    symbol: 'SOL/USDT',
    direction: 'SELL',
    entryPrice: 148,
    targetPrice: 142,
    stopLoss: 151,
    confidence: 68,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    timeframe: '1h',
    strategy: 'Resistance Rejection',
    status: 'COMPLETED',
    profitLoss: 4.2,
    indicators: [
      { name: 'RSI', value: '72', bullish: false },
      { name: 'MACD', value: 'Divergence', bullish: false },
      { name: 'Volume', value: 'Declining', bullish: false }
    ]
  },
  {
    id: '4',
    symbol: 'BNB/USDT',
    direction: 'SELL',
    entryPrice: 590,
    targetPrice: 570,
    stopLoss: 600,
    confidence: 82,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    timeframe: '15m',
    strategy: 'Trend Reversal',
    status: 'ACTIVE',
    indicators: [
      { name: 'RSI', value: '68', bullish: false },
      { name: 'EMA Cross', value: 'Bearish', bullish: false },
      { name: 'Ichimoku', value: 'Cloud Rejection', bullish: false }
    ]
  },
  {
    id: '5',
    symbol: 'XRP/USDT',
    direction: 'BUY',
    entryPrice: 0.525,
    targetPrice: 0.555,
    stopLoss: 0.51,
    confidence: 65,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    timeframe: '1d',
    strategy: 'Double Bottom',
    status: 'PENDING',
    indicators: [
      { name: 'RSI', value: '32', bullish: true },
      { name: 'Pattern', value: 'Double Bottom', bullish: true },
      { name: 'Volume', value: 'Increasing', bullish: true }
    ]
  }
];

// Trade Executions
export const mockExecutions: TradeExecution[] = [
  {
    id: '1',
    signalId: '1',
    symbol: 'BTC/USDT',
    direction: 'BUY',
    entryPrice: 51240,
    entryTime: new Date(Date.now() - 1800000).toISOString(),
    quantity: 0.15,
    status: 'FILLED'
  },
  {
    id: '3',
    signalId: '3',
    symbol: 'SOL/USDT',
    direction: 'SELL',
    entryPrice: 148.2,
    entryTime: new Date(Date.now() - 7200000).toISOString(),
    quantity: 5.5,
    status: 'FILLED',
    exitPrice: 142.8,
    exitTime: new Date(Date.now() - 3600000).toISOString(),
    profitLoss: 29.7,
    profitLossPercentage: 3.65
  },
  {
    id: '4',
    signalId: '4',
    symbol: 'BNB/USDT',
    direction: 'SELL',
    entryPrice: 589.8,
    entryTime: new Date(Date.now() - 10800000).toISOString(),
    quantity: 1.2,
    status: 'FILLED'
  }
];

// Performance Metrics
export const mockPerformance: PerformanceMetrics = {
  totalTrades: 42,
  winningTrades: 28,
  losingTrades: 14,
  winRate: 66.67,
  profitFactor: 2.3,
  averageProfit: 2.8,
  averageLoss: -1.5,
  totalProfit: 58.7,
  maxDrawdown: 8.2,
  sharpeRatio: 1.8
};

// AI Insights
export const mockInsights: AIInsight[] = [
  {
    id: '1',
    symbol: 'BTC/USDT',
    summary: "Bitcoin is showing strong bullish momentum with institutional buying pressure and decreasing exchange reserves. Technical indicators suggest continuation of the uptrend, with key resistance at $52,500.",
    sentiment: 'BULLISH',
    confidence: 85,
    factors: [
      'Decreasing exchange reserves',
      'Institutional accumulation',
      'Bullish MACD crossover on 4H timeframe',
      'Breaking above 200-day moving average'
    ],
    generatedAt: new Date().toISOString(),
    timeframe: '1d'
  },
  {
    id: '2',
    symbol: 'ETH/USDT',
    summary: "Ethereum is in a consolidation phase after recent gains. Network activity remains strong, but resistance at $2,900 has proven difficult to break. Watch for volume increase as a signal for the next move.",
    sentiment: 'NEUTRAL',
    confidence: 72,
    factors: [
      'Consolidating price action',
      'Strong network fundamentals',
      'Decreasing volatility',
      'Potential ascending triangle formation'
    ],
    generatedAt: new Date(Date.now() - 3600000).toISOString(),
    timeframe: '4h'
  }
];

// Helper formatting functions
export const formatCurrency = (value: number, precision = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value);
};

export const formatLargeCurrency = (value: number): string => {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else {
    return formatCurrency(value);
  }
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatCrypto = (value: number, symbol: string): string => {
  const precision = symbol.includes('BTC') ? 8 : symbol.includes('ETH') ? 6 : 4;
  return value.toFixed(precision);
};

// Generate chart data
export const generateChartData = (length: number, volatility: number, trend: 'up' | 'down' | 'sideways' = 'sideways') => {
  const data = [];
  let lastClose = 100 + Math.random() * 100;
  const now = Date.now();
  
  for (let i = 0; i < length; i++) {
    const trendFactor = trend === 'up' ? 0.2 : trend === 'down' ? -0.2 : 0;
    const change = (Math.random() - 0.5 + trendFactor) * volatility;
    lastClose = Math.max(1, lastClose + change);
    
    const open = lastClose - change * Math.random();
    const high = Math.max(open, lastClose) + Math.random() * volatility/2;
    const low = Math.min(open, lastClose) - Math.random() * volatility/2;
    
    data.push({
      timestamp: now - (length - i) * 3600000,
      open,
      high,
      low,
      close: lastClose,
      volume: Math.random() * 1000 + 500
    });
  }
  
  return data;
};

export const mockChartData = {
  'BTC/USDT': generateChartData(48, 5, 'up'),
  'ETH/USDT': generateChartData(48, 6, 'up'),
  'BNB/USDT': generateChartData(48, 4, 'down'),
  'SOL/USDT': generateChartData(48, 7, 'sideways'),
  'XRP/USDT': generateChartData(48, 3, 'down')
};
