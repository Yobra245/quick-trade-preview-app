
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

interface ChartHeaderProps {
  symbol: string;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  activePatterns: number;
  candleCount: number;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  symbol,
  connectionStatus,
  activePatterns,
  candleCount
}) => {
  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <Wifi className="w-3 h-3 mr-1" />
            Live
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Connecting
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h3 className="font-semibold text-lg">{symbol}</h3>
        <Badge variant="outline" className="text-xs">
          Professional Trading
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        {getConnectionBadge()}
        <div className="text-xs text-muted-foreground">
          {candleCount} candles • {activePatterns} patterns
        </div>
      </div>
    </div>
  );
};

export default ChartHeader;
