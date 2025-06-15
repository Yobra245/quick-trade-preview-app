
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface TradingProfile {
  id: string;
  user_id: string;
  exchange_api_key: string | null;
  exchange_secret_key: string | null;
  preferred_exchange: string;
  risk_tolerance: string;
  max_position_size: number;
  auto_trading_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tradingProfile, setTradingProfile] = useState<TradingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTradingProfile();
    } else {
      setProfile(null);
      setTradingProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const fetchTradingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTradingProfile(data);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updateTradingProfile = async (updates: Partial<TradingProfile>) => {
    try {
      const { data, error } = await supabase
        .from('trading_profiles')
        .update(updates)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setTradingProfile(data);
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  return {
    profile,
    tradingProfile,
    loading,
    error,
    updateProfile,
    updateTradingProfile,
    refreshProfile: fetchProfile,
    refreshTradingProfile: fetchTradingProfile
  };
}
