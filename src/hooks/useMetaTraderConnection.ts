
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export const useMetaTraderConnection = () => {
  const { selectedExchange } = useAppContext();
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const isMetaTrader = selectedExchange === 'mt4' || selectedExchange === 'mt5';
  const port = selectedExchange === 'mt4' ? '9090' : '9091';

  const checkConnection = async () => {
    if (!isMetaTrader) {
      setIsConnected(false);
      return;
    }

    setIsChecking(true);
    try {
      // Test the WebSocket connection to MetaTrader
      const ws = new WebSocket(`ws://localhost:${port}`);
      
      const timeout = setTimeout(() => {
        ws.close();
        setIsConnected(false);
        setIsChecking(false);
      }, 3000);

      ws.onopen = () => {
        clearTimeout(timeout);
        setIsConnected(true);
        setIsChecking(false);
        ws.close();
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        setIsConnected(false);
        setIsChecking(false);
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        setIsChecking(false);
      };

    } catch (error) {
      console.log('MetaTrader connection check failed:', error);
      setIsConnected(false);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isMetaTrader) {
      checkConnection();
      // Check connection every 30 seconds
      const interval = setInterval(checkConnection, 30000);
      return () => clearInterval(interval);
    } else {
      setIsConnected(false);
    }
  }, [selectedExchange, isMetaTrader, port]);

  return {
    isConnected,
    isChecking,
    isMetaTrader,
    checkConnection
  };
};
