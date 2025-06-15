
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  exchange_order_id: string | null;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'FAILED';
  strategy_id: string | null;
  created_at: string;
  filled_at: string | null;
}

export function useTrades() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure side field matches our expected type
      const typedTrades = (data || []).map(trade => ({
        ...trade,
        side: trade.side as 'BUY' | 'SELL',
        status: trade.status as 'PENDING' | 'FILLED' | 'CANCELLED' | 'FAILED'
      }));
      
      setTrades(typedTrades);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTrade = async (tradeData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    strategy_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user?.id,
          ...tradeData,
          total_amount: tradeData.quantity * tradeData.price,
          status: 'PENDING'
        })
        .select()
        .single();

      if (error) throw error;
      await fetchTrades();
      return { success: true, trade: data };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  return {
    trades,
    loading,
    error,
    createTrade,
    refreshTrades: fetchTrades
  };
}
