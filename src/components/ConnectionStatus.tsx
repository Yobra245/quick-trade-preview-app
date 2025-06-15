
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { useConnectionStatus } from '@/hooks/useLiveData';
import { useMetaTraderConnection } from '@/hooks/useMetaTraderConnection';

const ConnectionStatus: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const { apiKeysConfigured, selectedExchange } = useAppContext();
  const { isConnected: internetConnected } = useConnectionStatus();
  const { 
    isConnected: mtConnected, 
    isChecking: mtChecking, 
    isMetaTrader,
    connectionError 
  } = useMetaTraderConnection();

  // For MetaTrader, use the dedicated connection status
  const shouldUseMetaTraderStatus = isMetaTrader;
  
  useEffect(() => {
    if (shouldUseMetaTraderStatus) {
      // For MetaTrader, use the MT connection status
      if (mtChecking) {
        setApiStatus('checking');
      } else if (mtConnected) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } else {
      // For other exchanges, use the original logic
      const checkApiConnection = async () => {
        if (!apiKeysConfigured || !internetConnected) {
          setApiStatus('disconnected');
          return;
        }

        try {
          // Simulate API health check for regular exchanges
          setTimeout(() => {
            setApiStatus('connected');
          }, 1000);
        } catch (error) {
          setApiStatus('disconnected');
        }
      };

      checkApiConnection();
      const interval = setInterval(checkApiConnection, 30000);
      return () => clearInterval(interval);
    }
  }, [apiKeysConfigured, internetConnected, shouldUseMetaTraderStatus, mtConnected, mtChecking]);

  const getStatusColor = () => {
    if (!internetConnected) return 'destructive';
    if (apiStatus === 'connected') return 'default';
    if (apiStatus === 'checking') return 'secondary';
    return 'destructive';
  };

  const getStatusText = () => {
    if (!internetConnected) return 'Offline';
    if (shouldUseMetaTraderStatus) {
      if (connectionError) return 'Connection Error';
      if (apiStatus === 'connected') return `${selectedExchange?.toUpperCase()} Connected`;
      if (apiStatus === 'checking') return 'Connecting...';
      return `${selectedExchange?.toUpperCase()} Disconnected`;
    }
    if (apiStatus === 'connected') return 'Live Data';
    if (apiStatus === 'checking') return 'Connecting...';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (!internetConnected) return <WifiOff className="h-3 w-3" />;
    if (connectionError) return <AlertCircle className="h-3 w-3" />;
    if (apiStatus === 'connected') return <Wifi className="h-3 w-3" />;
    if (apiStatus === 'checking') return <Activity className="h-3 w-3 animate-pulse" />;
    return <WifiOff className="h-3 w-3" />;
  };

  return (
    <div className="flex flex-col gap-1">
      <Badge variant={getStatusColor()} className="flex items-center gap-1">
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
      {connectionError && (
        <span className="text-xs text-red-500 max-w-48 truncate" title={connectionError}>
          {connectionError}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;
