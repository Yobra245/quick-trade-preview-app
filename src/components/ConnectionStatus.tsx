
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const { apiKeysConfigured } = useAppContext();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkApiConnection = async () => {
      if (!apiKeysConfigured || !isOnline) {
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
  }, [apiKeysConfigured, isOnline]);

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (apiStatus === 'connected') return 'default';
    if (apiStatus === 'checking') return 'secondary';
    return 'destructive';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (apiStatus === 'connected') return 'Connected';
    if (apiStatus === 'checking') return 'Connecting...';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
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
