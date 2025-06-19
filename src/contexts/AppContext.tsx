import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '@/lib/services/DataService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AppContextType {
  apiKeysConfigured: boolean;
  selectedExchange: string;
  selectedSymbol: string;
  selectedMarketType: string;
  setSelectedExchange: (exchange: string) => void;
  setSelectedSymbol: (symbol: string) => void;
  setSelectedMarketType: (marketType: string) => void;
  refreshApiStatus: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [selectedMarketType, setSelectedMarketType] = useState('crypto');

  // Check if API keys are configured
  const checkApiKeys = async () => {
    if (!user) {
      setApiKeysConfigured(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      setApiKeysConfigured(!error && data && data.length > 0);
      
      // Initialize data service if API keys exist
      if (!error && data && data.length > 0) {
        await dataService.initialize(user.id);
      }
    } catch (error) {
      console.error('Error checking API keys:', error);
      setApiKeysConfigured(false);
    }
  };

  const refreshApiStatus = () => {
    checkApiKeys();
  };

  useEffect(() => {
    checkApiKeys();
  }, [user]);

  // Initialize data service when user changes
  useEffect(() => {
    if (user) {
      dataService.initialize(user.id);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        apiKeysConfigured,
        selectedExchange,
        selectedSymbol,
        selectedMarketType,
        setSelectedExchange,
        setSelectedSymbol,
        setSelectedMarketType,
        refreshApiStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
