import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export const useMetaTraderConnection = () => {
  const { selectedExchange } = useAppContext();
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isMetaTrader = selectedExchange === 'mt4' || selectedExchange === 'mt5';
  const port = selectedExchange === 'mt4' ? '9090' : '9091';

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  const connect = () => {
    if (!isMetaTrader) {
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    // Don't attempt connection if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsChecking(true);
    setConnectionError(null);
    
    try {
      console.log(`Attempting to connect to MetaTrader on port ${port}`);
      
      const ws = new WebSocket(`ws://localhost:${port}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`Connected to ${selectedExchange?.toUpperCase()} on port ${port}`);
        setIsConnected(true);
        setIsChecking(false);
        setConnectionError(null);
        
        // Send initial ping to verify EA is responding
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        
        // Set up periodic ping to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 10000); // Ping every 10 seconds
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            console.log('Received pong from MetaTrader EA');
          }
        } catch (error) {
          console.log('Received non-JSON message from MetaTrader:', event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('MetaTrader WebSocket error:', error);
        setConnectionError('Connection failed. Ensure MetaTrader is running with SignalAI EA.');
        setIsConnected(false);
        setIsChecking(false);
      };

      ws.onclose = (event) => {
        console.log(`MetaTrader connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);
        setIsChecking(false);
        
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt to reconnect after 5 seconds if not manually closed
        if (event.code !== 1000 && isMetaTrader) {
          setConnectionError('Connection lost. Attempting to reconnect...');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      // Connection timeout
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          setConnectionError('Connection timeout. Check if MetaTrader is running.');
          setIsConnected(false);
          setIsChecking(false);
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect. Check MetaTrader configuration.');
      setIsConnected(false);
      setIsChecking(false);
    }
  };

  const disconnect = () => {
    cleanup();
    setIsConnected(false);
    setIsChecking(false);
    setConnectionError(null);
  };

  const checkConnection = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Connection is already open, just send a ping
      wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    } else {
      // Reconnect
      connect();
    }
  };

  useEffect(() => {
    if (isMetaTrader) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      cleanup();
    };
  }, [selectedExchange, isMetaTrader, port]);

  return {
    isConnected,
    isChecking,
    isMetaTrader,
    connectionError,
    checkConnection,
    connect,
    disconnect
  };
};
