
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeys {
  exchangeApiKey: string;
  exchangeSecretKey: string;
  dataProviderApiKey: string;
}

interface AppContextType {
  apiKeys: ApiKeys;
  setApiKeys: (keys: ApiKeys) => void;
  apiKeysConfigured: boolean;
  selectedExchange: string;
  setSelectedExchange: (exchange: string) => void;
  selectedMarketType: string;
  setSelectedMarketType: (marketType: string) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeysState] = useState<ApiKeys>({
    exchangeApiKey: '',
    exchangeSecretKey: '',
    dataProviderApiKey: ''
  });

  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [selectedMarketType, setSelectedMarketType] = useState('crypto');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('signalai-api-keys');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setApiKeysState(parsedKeys);
      } catch (error) {
        console.error('Failed to parse saved API keys:', error);
      }
    }
  }, []);

  // Save API keys to localStorage whenever they change
  const setApiKeys = (keys: ApiKeys) => {
    setApiKeysState(keys);
    localStorage.setItem('signalai-api-keys', JSON.stringify(keys));
  };

  // Check if API keys are configured
  const apiKeysConfigured = Boolean(
    apiKeys.exchangeApiKey && apiKeys.exchangeSecretKey
  );

  // Update symbol when market type changes
  useEffect(() => {
    switch (selectedMarketType) {
      case 'crypto':
        setSelectedSymbol('BTC/USDT');
        break;
      case 'forex':
        setSelectedSymbol('EUR/USD');
        break;
      case 'stocks':
        setSelectedSymbol('AAPL');
        break;
      default:
        setSelectedSymbol('BTC/USDT');
    }
  }, [selectedMarketType]);

  const value: AppContextType = {
    apiKeys,
    setApiKeys,
    apiKeysConfigured,
    selectedExchange,
    setSelectedExchange,
    selectedMarketType,
    setSelectedMarketType,
    selectedSymbol,
    setSelectedSymbol,
  };

  return (
    <AppContext.Provider value={value}>
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
