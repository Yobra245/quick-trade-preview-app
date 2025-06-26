
import { useMemo } from 'react';
import { ChartData } from '@/lib/types';

export interface Pattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  startIndex: number;
  endIndex: number;
  description: string;
  signal: 'buy' | 'sell' | 'watch';
}

export function usePatternRecognition(data: ChartData[]): Pattern[] {
  return useMemo(() => {
    if (data.length < 20) return [];
    
    const patterns: Pattern[] = [];
    
    // Double Top Pattern
    const doubleTop = detectDoubleTop(data);
    if (doubleTop) patterns.push(doubleTop);
    
    // Double Bottom Pattern
    const doubleBottom = detectDoubleBottom(data);
    if (doubleBottom) patterns.push(doubleBottom);
    
    // Head and Shoulders
    const headAndShoulders = detectHeadAndShoulders(data);
    if (headAndShoulders) patterns.push(headAndShoulders);
    
    // Triangle Patterns
    const triangle = detectTriangle(data);
    if (triangle) patterns.push(triangle);
    
    // Support/Resistance Breaks
    const breakout = detectBreakout(data);
    if (breakout) patterns.push(breakout);
    
    return patterns;
  }, [data]);
}

function detectDoubleTop(data: ChartData[]): Pattern | null {
  const recentData = data.slice(-30);
  const highs = recentData.map((d, i) => ({ value: d.high, index: i }))
    .filter((_, i, arr) => {
      if (i === 0 || i === arr.length - 1) return false;
      return arr[i].value > arr[i - 1].value && arr[i].value > arr[i + 1].value;
    });
  
  if (highs.length >= 2) {
    const lastTwo = highs.slice(-2);
    const priceDiff = Math.abs(lastTwo[0].value - lastTwo[1].value);
    const avgPrice = (lastTwo[0].value + lastTwo[1].value) / 2;
    
    if (priceDiff / avgPrice < 0.02) { // Within 2%
      return {
        id: `double-top-${Date.now()}`,
        name: 'Double Top',
        type: 'bearish',
        confidence: 0.75,
        startIndex: data.length - 30 + lastTwo[0].index,
        endIndex: data.length - 30 + lastTwo[1].index,
        description: 'Bearish reversal pattern with two peaks at similar levels',
        signal: 'sell'
      };
    }
  }
  
  return null;
}

function detectDoubleBottom(data: ChartData[]): Pattern | null {
  const recentData = data.slice(-30);
  const lows = recentData.map((d, i) => ({ value: d.low, index: i }))
    .filter((_, i, arr) => {
      if (i === 0 || i === arr.length - 1) return false;
      return arr[i].value < arr[i - 1].value && arr[i].value < arr[i + 1].value;
    });
  
  if (lows.length >= 2) {
    const lastTwo = lows.slice(-2);
    const priceDiff = Math.abs(lastTwo[0].value - lastTwo[1].value);
    const avgPrice = (lastTwo[0].value + lastTwo[1].value) / 2;
    
    if (priceDiff / avgPrice < 0.02) { // Within 2%
      return {
        id: `double-bottom-${Date.now()}`,
        name: 'Double Bottom',
        type: 'bullish',
        confidence: 0.75,
        startIndex: data.length - 30 + lastTwo[0].index,
        endIndex: data.length - 30 + lastTwo[1].index,
        description: 'Bullish reversal pattern with two lows at similar levels',
        signal: 'buy'
      };
    }
  }
  
  return null;
}

function detectHeadAndShoulders(data: ChartData[]): Pattern | null {
  const recentData = data.slice(-40);
  const highs = recentData.map((d, i) => ({ value: d.high, index: i }))
    .filter((_, i, arr) => {
      if (i === 0 || i === arr.length - 1) return false;
      return arr[i].value > arr[i - 1].value && arr[i].value > arr[i + 1].value;
    });
  
  if (highs.length >= 3) {
    const lastThree = highs.slice(-3);
    const [left, head, right] = lastThree;
    
    // Head should be higher than shoulders
    if (head.value > left.value && head.value > right.value) {
      // Shoulders should be roughly equal
      const shoulderDiff = Math.abs(left.value - right.value);
      const avgShoulder = (left.value + right.value) / 2;
      
      if (shoulderDiff / avgShoulder < 0.03) { // Within 3%
        return {
          id: `head-shoulders-${Date.now()}`,
          name: 'Head and Shoulders',
          type: 'bearish',
          confidence: 0.8,
          startIndex: data.length - 40 + left.index,
          endIndex: data.length - 40 + right.index,
          description: 'Bearish reversal pattern with three peaks',
          signal: 'sell'
        };
      }
    }
  }
  
  return null;
}

function detectTriangle(data: ChartData[]): Pattern | null {
  const recentData = data.slice(-25);
  
  // Calculate trend lines for highs and lows
  const highs = recentData.map(d => d.high);
  const lows = recentData.map(d => d.low);
  
  // Simple linear regression for trend detection
  const highTrend = calculateTrend(highs);
  const lowTrend = calculateTrend(lows);
  
  // Ascending triangle: horizontal resistance, rising support
  if (Math.abs(highTrend) < 0.001 && lowTrend > 0.001) {
    return {
      id: `ascending-triangle-${Date.now()}`,
      name: 'Ascending Triangle',
      type: 'bullish',
      confidence: 0.7,
      startIndex: data.length - 25,
      endIndex: data.length - 1,
      description: 'Bullish continuation pattern with rising lows and horizontal highs',
      signal: 'buy'
    };
  }
  
  // Descending triangle: falling resistance, horizontal support
  if (highTrend < -0.001 && Math.abs(lowTrend) < 0.001) {
    return {
      id: `descending-triangle-${Date.now()}`,
      name: 'Descending Triangle',
      type: 'bearish',
      confidence: 0.7,
      startIndex: data.length - 25,
      endIndex: data.length - 1,
      description: 'Bearish continuation pattern with falling highs and horizontal lows',
      signal: 'sell'
    };
  }
  
  return null;
}

function detectBreakout(data: ChartData[]): Pattern | null {
  if (data.length < 20) return null;
  
  const recent = data.slice(-10);
  const previous = data.slice(-20, -10);
  
  const recentHigh = Math.max(...recent.map(d => d.high));
  const recentLow = Math.min(...recent.map(d => d.low));
  const previousHigh = Math.max(...previous.map(d => d.high));
  const previousLow = Math.min(...previous.map(d => d.low));
  
  // Upward breakout
  if (recentHigh > previousHigh * 1.02) {
    return {
      id: `breakout-up-${Date.now()}`,
      name: 'Upward Breakout',
      type: 'bullish',
      confidence: 0.65,
      startIndex: data.length - 20,
      endIndex: data.length - 1,
      description: 'Price breaking above resistance level',
      signal: 'buy'
    };
  }
  
  // Downward breakout
  if (recentLow < previousLow * 0.98) {
    return {
      id: `breakout-down-${Date.now()}`,
      name: 'Downward Breakout',
      type: 'bearish',
      confidence: 0.65,
      startIndex: data.length - 20,
      endIndex: data.length - 1,
      description: 'Price breaking below support level',
      signal: 'sell'
    };
  }
  
  return null;
}

function calculateTrend(values: number[]): number {
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}
