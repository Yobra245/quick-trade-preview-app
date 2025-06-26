import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketManager } from '@/lib/services/WebSocketManager';
import { realDataService } from '@/lib/services/RealDataService';
import { ChartData } from '@/lib/types';

interface UseRealTimeChartOptions {
  symbol: string;
  interval: string;
  enabled?: boolean;
  historyLimit?: number;
}

interface RealTimeChartData {
  historicalData: ChartData[];
  currentCandle: ChartData | null;
  currentPrice: number;
  loading: boolean;
  error: string | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
}

export function useRealTimeChart({
  symbol,
  interval,
  enabled = true,
  historyLimit = 100
}: UseRealTimeChartOptions): RealTimeChartData {
  const [historicalData, setHistoricalData] = useState<ChartData[]>([]);
  const [currentCandle, setCurrentCandle] = useState<ChartData | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const streamIdRef = useRef<string | null>(null);
  const tickerStreamIdRef = useRef<string | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Handle real-time kline updates
  const handleKlineUpdate = useCallback((klineData: any) => {
    const newCandle: ChartData = {
      timestamp: klineData.timestamp,
      open: klineData.open,
      high: klineData.high,
      low: klineData.low,
      close: klineData.close,
      volume: klineData.volume
    };

    if (klineData.isClosed) {
      // Kline is finalized, add it to historical data
      setHistoricalData(prev => {
        const updated = [...prev];
        // Check if this candle already exists (replace) or add new
        const existingIndex = updated.findIndex(candle => candle.timestamp === newCandle.timestamp);
        if (existingIndex >= 0) {
          updated[existingIndex] = newCandle;
        } else {
          updated.push(newCandle);
          // Keep only the most recent candles
          if (updated.length > historyLimit) {
            updated.shift();
          }
        }
        return updated;
      });
      setCurrentCandle(null); // Clear current candle as it's now historical
    } else {
      // Update current forming candle
      setCurrentCandle(newCandle);
    }

    setCurrentPrice(klineData.close);
    setError(null);
    
    // Throttle updates to prevent excessive re-renders
    const now = Date.now();
    if (now - lastUpdateRef.current >= 16) { // ~60fps
      lastUpdateRef.current = now;
    }
  }, [historyLimit]);

  // Handle real-time price updates
  const handleTickerUpdate = useCallback((tickerData: any) => {
    setCurrentPrice(tickerData.price);
  }, []);

  // Load historical data
  const loadHistoricalData = useCallback(async () => {
    if (!enabled || !symbol) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await realDataService.fetchChartData(symbol, interval, historyLimit);
      setHistoricalData(data);
      
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load historical data');
      console.error('Error loading historical data:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, enabled, historyLimit]);

  // Set up WebSocket connections
  useEffect(() => {
    if (!enabled || !symbol) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    // Subscribe to kline stream for candlestick data
    const klineStreamId = webSocketManager.subscribeToKlines(
      symbol.replace('/', ''), // Remove slash for Binance format
      interval,
      handleKlineUpdate
    );
    streamIdRef.current = klineStreamId;

    // Subscribe to ticker stream for current price
    const tickerStreamId = webSocketManager.subscribeToTicker(
      symbol.replace('/', ''),
      handleTickerUpdate
    );
    tickerStreamIdRef.current = tickerStreamId;

    // Monitor connection status
    const statusInterval = setInterval(() => {
      const status = webSocketManager.getConnectionStatus(klineStreamId);
      setConnectionStatus(status);
    }, 1000);

    // Load historical data
    loadHistoricalData();

    return () => {
      clearInterval(statusInterval);
      if (streamIdRef.current) {
        webSocketManager.unsubscribe(streamIdRef.current);
      }
      if (tickerStreamIdRef.current) {
        webSocketManager.unsubscribe(tickerStreamIdRef.current);
      }
    };
  }, [symbol, interval, enabled, handleKlineUpdate, handleTickerUpdate, loadHistoricalData]);

  return {
    historicalData,
    currentCandle,
    currentPrice,
    loading,
    error,
    connectionStatus
  };
}
