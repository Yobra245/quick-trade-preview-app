
import { useMemo } from 'react';
import { ChartData } from '@/lib/types';

interface TechnicalIndicators {
  sma: number[];
  ema: number[];
  rsi: number[];
  macd: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}

export function useTechnicalIndicators(data: ChartData[], period: number = 20): TechnicalIndicators {
  return useMemo(() => {
    if (data.length < period) {
      return {
        sma: [],
        ema: [],
        rsi: [],
        macd: { macd: [], signal: [], histogram: [] },
        bollingerBands: { upper: [], middle: [], lower: [] }
      };
    }

    const closes = data.map(d => d.close);
    
    return {
      sma: calculateSMA(closes, period),
      ema: calculateEMA(closes, period),
      rsi: calculateRSI(closes, 14),
      macd: calculateMACD(closes),
      bollingerBands: calculateBollingerBands(closes, period)
    };
  }, [data, period]);
}

function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  result[0] = data[0];
  
  for (let i = 1; i < data.length; i++) {
    result[i] = (data[i] * multiplier) + (result[i - 1] * (1 - multiplier));
  }
  return result;
}

function calculateRSI(data: number[], period: number = 14): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }
  }
  
  return result;
}

function calculateMACD(data: number[]): { macd: number[], signal: number[], histogram: number[] } {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd: number[] = [];
  
  const startIndex = Math.max(0, ema26.length - ema12.length);
  for (let i = startIndex; i < ema12.length; i++) {
    macd.push(ema12[i] - ema26[i - startIndex]);
  }
  
  const signal = calculateEMA(macd, 9);
  const histogram = macd.slice(-signal.length).map((m, i) => m - signal[i]);
  
  return { macd, signal, histogram };
}

function calculateBollingerBands(data: number[], period: number): { upper: number[], middle: number[], lower: number[] } {
  const sma = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i - period + 1];
    const variance = slice.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    upper.push(mean + (stdDev * 2));
    lower.push(mean - (stdDev * 2));
  }
  
  return { upper, middle: sma, lower };
}
