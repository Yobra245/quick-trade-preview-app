import { StrategyConfig, StrategySignal, MarketData, BacktestResult } from './types';

export abstract class BaseStrategy {
  protected config: StrategyConfig;
  protected parameters: Record<string, any>;

  constructor(config: StrategyConfig, parameters: Record<string, any> = {}) {
    this.config = config;
    this.parameters = { ...this.getDefaultParameters(), ...parameters };
  }

  abstract analyze(data: MarketData[]): StrategySignal;
  abstract getDefaultParameters(): Record<string, any>;
  abstract getName(): string;
  abstract getDescription(): string;

  protected createNeutralSignal(currentData: MarketData): StrategySignal {
    return {
      action: 'HOLD',
      strength: 0,
      confidence: 0,
      entryPrice: currentData.close,
      stopLoss: currentData.close,
      takeProfit: currentData.close,
      indicators: [],
      reasoning: ['Insufficient data for analysis']
    };
  }

  protected calculateSMA(data: number[], period: number): number[] {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  protected calculateEMA(data: number[], period: number): number[] {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    ema[period - 1] = sum / period;

    // Calculate EMA for rest of values
    for (let i = period; i < data.length; i++) {
      ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    
    return ema;
  }

  protected calculateRSI(data: number[], period: number = 14): number[] {
    const rsi = [];
    const gains = [];
    const losses = [];

    // Calculate gains and losses
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate average gains and losses
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  protected calculateMACD(data: number[]): { macd: number[], signal: number[], histogram: number[] } {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    const macd = [];
    for (let i = 25; i < data.length; i++) {
      macd.push(ema12[i] - ema26[i]);
    }

    const signal = this.calculateEMA(macd, 9);
    const histogram = macd.map((value, index) => 
      index >= signal.length ? 0 : value - signal[index]
    );

    return { macd, signal, histogram };
  }

  protected calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(data, period);
    const bands = { upper: [], middle: [], lower: [] };

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);

      bands.middle.push(mean);
      bands.upper.push(mean + (std * stdDev));
      bands.lower.push(mean - (std * stdDev));
    }

    return bands;
  }

  protected calculateATR(data: MarketData[], period: number = 14): number {
    const trueRanges = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }

    return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
  }
}
