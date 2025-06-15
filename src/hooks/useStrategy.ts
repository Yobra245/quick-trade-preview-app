
import { useState, useEffect, useCallback } from 'react';
import { strategyService, StrategyResult } from '@/lib/services/StrategyService';

export function useStrategySignals(
  strategyId: string,
  symbol: string,
  parameters: Record<string, any> = {},
  enabled: boolean = true
) {
  const [signals, setSignals] = useState<StrategyResult[]>([]);
  const [latestSignal, setLatestSignal] = useState<StrategyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignal = useCallback((result: StrategyResult) => {
    setLatestSignal(result);
    setSignals(prev => {
      const newSignals = [result, ...prev].slice(0, 10); // Keep last 10 signals
      return newSignals;
    });
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled || !strategyId || !symbol) return;

    try {
      setLoading(true);
      strategyService.subscribeToStrategy(strategyId, symbol, parameters, handleSignal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to strategy');
      setLoading(false);
    }

    return () => {
      strategyService.unsubscribeFromStrategy(strategyId, symbol, handleSignal);
    };
  }, [strategyId, symbol, JSON.stringify(parameters), enabled, handleSignal]);

  return { signals, latestSignal, loading, error };
}

export function useBacktest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = useCallback(async (
    strategyId: string,
    symbol: string,
    parameters: Record<string, any>,
    startDate: Date,
    endDate: Date,
    initialCapital: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await strategyService.runBacktest(
        strategyId,
        symbol,
        parameters,
        startDate,
        endDate,
        initialCapital
      );
      setResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backtest failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { runBacktest, results, loading, error };
}
