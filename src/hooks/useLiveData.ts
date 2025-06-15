
import { useState, useEffect, useCallback, useRef } from 'react';
import { dataService, MarketDataUpdate, PriceUpdate } from '@/lib/services/DataService';
import { ChartData } from '@/lib/types';

export interface UseLiveDataOptions {
  enabled?: boolean;
  updateInterval?: number;
}

export function useLivePrice(symbol: string, options: UseLiveDataOptions = {}) {
  const { enabled = true, updateInterval = 1000 } = options;
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const handlePriceUpdate = useCallback((update: PriceUpdate) => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= updateInterval) {
      setPrice(update.price);
      setLoading(false);
      setError(null);
      lastUpdateRef.current = now;
    }
  }, [updateInterval]);

  useEffect(() => {
    if (!enabled || !symbol) return;

    setLoading(true);
    dataService.subscribeToPriceUpdates(symbol, handlePriceUpdate);

    return () => {
      dataService.unsubscribe(symbol, handlePriceUpdate);
    };
  }, [symbol, enabled, handlePriceUpdate]);

  return { price, loading, error };
}

export function useLiveMarketData(symbol: string, options: UseLiveDataOptions = {}) {
  const { enabled = true, updateInterval = 2000 } = options;
  const [marketData, setMarketData] = useState<MarketDataUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const handleMarketUpdate = useCallback((update: MarketDataUpdate) => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= updateInterval) {
      setMarketData(update);
      setLoading(false);
      setError(null);
      lastUpdateRef.current = now;
    }
  }, [updateInterval]);

  useEffect(() => {
    if (!enabled || !symbol) return;

    setLoading(true);
    dataService.subscribeToMarketData(symbol, handleMarketUpdate);

    return () => {
      dataService.unsubscribe(symbol, handleMarketUpdate);
    };
  }, [symbol, enabled, handleMarketUpdate]);

  return { marketData, loading, error };
}

export function useLiveChartData(symbol: string, timeframe: string = '1h', options: UseLiveDataOptions = {}) {
  const { enabled = true } = options;
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !symbol) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dataService.fetchChartData(symbol, timeframe, 48);
        setChartData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh chart data periodically
    const interval = setInterval(fetchData, 60000); // Every minute

    return () => clearInterval(interval);
  }, [symbol, timeframe, enabled]);

  return { chartData, loading, error, refetch: () => setChartData([]) };
}

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    // Monitor connection status
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  return { isConnected, reconnecting };
}
