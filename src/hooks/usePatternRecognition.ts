
import { useMemo } from 'react';
import { ChartData } from '@/lib/types';

interface Pattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  signal: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export function usePatternRecognition(data: ChartData[]): Pattern[] {
  return useMemo(() => {
    if (data.length < 20) return [];

    const patterns: Pattern[] = [];

    // Simple pattern detection algorithms
    try {
      // Detect Double Top pattern
      const doubleTop = detectDoubleTop(data);
      if (doubleTop) patterns.push(doubleTop);

      // Detect Double Bottom pattern
      const doubleBottom = detectDoubleBottom(data);
      if (doubleBottom) patterns.push(doubleBottom);

      // Detect Head and Shoulders
      const headAndShoulders = detectHeadAndShoulders(data);
      if (headAndShoulders) patterns.push(headAndShoulders);

      // Detect Triangle patterns
      const triangle = detectTriangle(data);
      if (triangle) patterns.push(triangle);

    } catch (error) {
      console.error('Pattern recognition error:', error);
    }

    return patterns;
  }, [data]);
}

function detectDoubleTop(data: ChartData[]): Pattern | null {
  if (data.length < 10) return null;
  
  const recent = data.slice(-20);
  const highs = recent.map((candle, index) => ({ price: candle.high, index }));
  
  // Find two similar highs with a valley between them
  for (let i = 2; i < highs.length - 2; i++) {
    const current = highs[i];
    for (let j = i + 4; j < highs.length - 1; j++) {
      const next = highs[j];
      const priceDiff = Math.abs(current.price - next.price) / current.price;
      
      if (priceDiff < 0.02) { // Within 2%
        const valley = Math.min(...highs.slice(i + 1, j).map(h => h.price));
        if (valley < current.price * 0.95) { // Valley is at least 5% lower
          return {
            id: `double-top-${Date.now()}`,
            name: 'Double Top',
            type: 'bearish',
            signal: 'SELL',
            confidence: 0.75,
            startIndex: current.index,
            endIndex: next.index
          };
        }
      }
    }
  }
  
  return null;
}

function detectDoubleBottom(data: ChartData[]): Pattern | null {
  if (data.length < 10) return null;
  
  const recent = data.slice(-20);
  const lows = recent.map((candle, index) => ({ price: candle.low, index }));
  
  // Find two similar lows with a peak between them
  for (let i = 2; i < lows.length - 2; i++) {
    const current = lows[i];
    for (let j = i + 4; j < lows.length - 1; j++) {
      const next = lows[j];
      const priceDiff = Math.abs(current.price - next.price) / current.price;
      
      if (priceDiff < 0.02) { // Within 2%
        const peak = Math.max(...lows.slice(i + 1, j).map(l => l.price));
        if (peak > current.price * 1.05) { // Peak is at least 5% higher
          return {
            id: `double-bottom-${Date.now()}`,
            name: 'Double Bottom',
            type: 'bullish',
            signal: 'BUY',
            confidence: 0.75,
            startIndex: current.index,
            endIndex: next.index
          };
        }
      }
    }
  }
  
  return null;
}

function detectHeadAndShoulders(data: ChartData[]): Pattern | null {
  if (data.length < 15) return null;
  
  const recent = data.slice(-30);
  
  // Simplified head and shoulders detection
  const peaks = [];
  for (let i = 1; i < recent.length - 1; i++) {
    if (recent[i].high > recent[i-1].high && recent[i].high > recent[i+1].high) {
      peaks.push({ price: recent[i].high, index: i });
    }
  }
  
  if (peaks.length >= 3) {
    const [leftShoulder, head, rightShoulder] = peaks.slice(-3);
    
    if (head.price > leftShoulder.price && head.price > rightShoulder.price) {
      const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price;
      
      if (shoulderDiff < 0.05) { // Shoulders within 5% of each other
        return {
          id: `head-shoulders-${Date.now()}`,
          name: 'Head and Shoulders',
          type: 'bearish',
          signal: 'SELL',
          confidence: 0.8,
          startIndex: leftShoulder.index,
          endIndex: rightShoulder.index
        };
      }
    }
  }
  
  return null;
}

function detectTriangle(data: ChartData[]): Pattern | null {
  if (data.length < 10) return null;
  
  const recent = data.slice(-15);
  const highs = recent.map(candle => candle.high);
  const lows = recent.map(candle => candle.low);
  
  // Simple ascending triangle detection
  const recentHighs = highs.slice(-5);
  const recentLows = lows.slice(-5);
  
  const highsIncreasing = recentLows.every((low, i) => 
    i === 0 || low >= recentLows[i - 1] * 0.99
  );
  
  const highsFlat = recentHighs.every((high, i) => 
    i === 0 || Math.abs(high - recentHighs[0]) / recentHighs[0] < 0.03
  );
  
  if (highsIncreasing && highsFlat) {
    return {
      id: `ascending-triangle-${Date.now()}`,
      name: 'Ascending Triangle',
      type: 'bullish',
      signal: 'BREAKOUT',
      confidence: 0.65,
      startIndex: recent.length - 10,
      endIndex: recent.length - 1
    };
  }
  
  return null;
}
