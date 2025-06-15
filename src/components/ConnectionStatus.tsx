
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { useConnectionStatus } from '@/hooks/useLiveData';

const ConnectionStatus: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const { apiKeysConfigured } = useAppContext();
  const { isConnected } = useConnectionStatus();

  useEffect(() => {
    const checkApiConnection = async () => {
      if (!apiKeysConfigured || !isConnected) {
        setApiStatus('disconnected');
        return;
      }

      try {
        // Simulate API health check
        setTimeout(() => {
          setApiStatus('connected');
        }, 1000);
      } catch (error) {
        setApiStatus('disconnected');
      }
    };

    checkApiConnection();
    const interval = setInterval(checkApiConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [apiKeysConfigured, isConnected]);

  const getStatusColor = () => {
    if (!isConnected) return 'destructive';
    if (apiStatus === 'connected') return 'default';
    if (apiStatus === 'checking') return 'secondary';
    return 'destructive';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Offline';
    if (apiStatus === 'connected') return 'Live Data';
    if (apiStatus === 'checking') return 'Connecting...';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    if (apiStatus === 'connected') return <Wifi className="h-3 w-3" />;
    if (apiStatus === 'checking') return <Activity className="h-3 w-3 animate-pulse" />;
    return <WifiOff className="h-3 w-3" />;
  };

  return (
    <Badge variant={getStatusColor()} className="flex items-center gap-1">
      {getStatusIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </Badge>
  );
};

export default ConnectionStatus;
