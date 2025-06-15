
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  average_price: number | null;
  current_value: number | null;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  last_updated: string;
}

export function usePortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = async (symbol: string, quantity: number, price: number) => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .upsert({
          user_id: user?.id,
          symbol,
          quantity,
          average_price: price,
          current_value: quantity * price,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      await fetchPortfolio();
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  return {
    portfolio,
    loading,
    error,
    addToPortfolio,
    refreshPortfolio: fetchPortfolio
  };
}
