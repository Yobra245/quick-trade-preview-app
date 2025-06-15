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

  console.log('useMetaTraderConnection - selectedExchange:', selectedExchange);
  console.log('useMetaTraderConnection - isMetaTrader:', isMetaTrader);
  console.log('useMetaTraderConnection - port:', port);

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
    console.log('useMetaTraderConnection connect() called - isMetaTrader:', isMetaTrader);
    
    if (!isMetaTrader) {
      console.log('🔌 Not a MetaTrader exchange, setting disconnected state');
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    // Don't attempt connection if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔄 Connection already exists, skipping connect attempt');
      return;
    }

    setIsChecking(true);
    setConnectionError(null);
    
    try {
      console.log(`🔌 Attempting to connect to MetaTrader on port ${port}`);
      console.log(`Current location: ${window.location.protocol}//${window.location.host}`);
      console.log(`WebSocket URL: ws://localhost:${port}`);
      
      const ws = new WebSocket(`ws://localhost:${port}`);
      wsRef.current = ws;

      ws.addEventListener('open', () => {
        console.log(`✅ Connected to ${selectedExchange?.toUpperCase()} on port ${port}`);
        setIsConnected(true);
        setIsChecking(false);
        setConnectionError(null);
        
        // Send initial ping to verify EA is responding
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        console.log('📤 Sent initial ping to EA');
        
        // Set up periodic ping to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            console.log('📤 Sent periodic ping to EA');
          }
        }, 10000); // Ping every 10 seconds
      });

      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📥 Received message from MetaTrader EA:', data);
          if (data.type === 'pong') {
            console.log('✅ Received pong from MetaTrader EA - connection verified');
          }
        } catch (error) {
          console.log('📥 Received non-JSON message from MetaTrader:', event.data);
        }
      });

      ws.addEventListener('error', (error) => {
        console.error('❌ MetaTrader WebSocket error details:', {
          error,
          readyState: ws.readyState,
          url: ws.url,
          protocol: ws.protocol,
          extensions: ws.extensions
        });
        
        let errorMessage = 'Connection failed. ';
        if (ws.readyState === WebSocket.CONNECTING) {
          errorMessage += 'Unable to establish connection to MetaTrader EA. Check if MT5 is running and EA is active on port ' + port + '.';
        } else {
          errorMessage += 'Connection error occurred. Ensure MetaTrader is running with SignalAI EA.';
        }
        
        setConnectionError(errorMessage);
        setIsConnected(false);
        setIsChecking(false);
      });

      ws.addEventListener('close', (event) => {
        console.log(`❌ MetaTrader connection closed. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        
        const closeReasons = {
          1000: 'Normal closure',
          1001: 'Going away',
          1002: 'Protocol error',
          1003: 'Unsupported data type',
          1005: 'No status code present',
          1006: 'Abnormal closure (network error)',
          1007: 'Invalid frame payload data',
          1008: 'Policy violation',
          1009: 'Message too big',
          1010: 'Missing extension',
          1011: 'Internal error',
          1015: 'TLS handshake error'
        };
        
        console.log(`Close reason: ${closeReasons[event.code] || 'Unknown'}`);
        
        setIsConnected(false);
        setIsChecking(false);
        
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt to reconnect after 5 seconds if not manually closed
        if (event.code !== 1000 && isMetaTrader) {
          setConnectionError(`Connection lost (${closeReasons[event.code] || event.code}). Attempting to reconnect...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting automatic reconnection...');
            connect();
          }, 5000);
        }
      });

      // Connection timeout
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('⏰ Connection timeout - force closing WebSocket');
          ws.close();
          setConnectionError('Connection timeout. Verify MetaTrader is running and EA is properly configured on port ' + port + '.');
          setIsConnected(false);
          setIsChecking(false);
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection. Check MetaTrader configuration.');
      setIsConnected(false);
      setIsChecking(false);
    }
  };

  const disconnect = () => {
    console.log('🔌 Manually disconnecting from MetaTrader');
    cleanup();
    setIsConnected(false);
    setIsChecking(false);
    setConnectionError(null);
  };

  const checkConnection = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('📡 Connection is open, sending ping...');
      wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    } else {
      console.log('🔄 Connection not open, attempting to reconnect...');
      connect();
    }
  };

  useEffect(() => {
    console.log(`🔄 useEffect triggered - selectedExchange: ${selectedExchange}, isMetaTrader: ${isMetaTrader}`);
    
    if (isMetaTrader) {
      console.log(`🔄 Setting up MetaTrader connection for ${selectedExchange}`);
      connect();
    } else {
      console.log('🔌 Disconnecting - not a MetaTrader exchange');
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
