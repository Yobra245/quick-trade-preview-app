
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RealTimeChart from './RealTimeChart';
import { TimeframeType } from './EnhancedChart';
import { 
  FullscreenIcon, 
  Minimize2, 
  Settings, 
  TrendingUp,
  Volume2,
  DollarSign,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradingViewProps {
  symbol?: string;
  defaultInterval?: TimeframeType;
  className?: string;
}

const TradingView: React.FC<TradingViewProps> = ({
  symbol = 'BTC/USDT',
  defaultInterval = '1m',
  className
}) => {
  const [currentInterval, setCurrentInterval] = useState<TimeframeType>(defaultInterval);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);

  // Popular trading pairs
  const popularPairs = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 
    'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'AVAX/USDT'
  ];

  // Quick interval selector
  const quickIntervals: TimeframeType[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

  const handleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      document.documentElement.requestFullscreen?.();
    } else {
      // Exit fullscreen
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={cn(
      "w-full h-full bg-background",
      isFullscreen && "fixed inset-0 z-50 bg-black p-4",
      className
    )}>
      {/* Top toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg">
        <div className="flex items-center gap-4">
          {/* Symbol selector */}
          <div className="flex items-center gap-2">
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {popularPairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
            <Badge variant="secondary" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Spot
            </Badge>
          </div>

          {/* Quick intervals */}
          <div className="flex items-center gap-1 bg-accent/50 rounded-md p-1">
            {quickIntervals.map(intervalOption => (
              <Button
                key={intervalOption}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2 py-1 text-xs h-6",
                  currentInterval === intervalOption 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setCurrentInterval(intervalOption)}
              >
                {intervalOption}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Trading indicators */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>24h: +2.34%</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Volume2 className="w-4 h-4" />
              <span>Vol: 1.2B</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>24h High: $43,250</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {/* Settings handler */}}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <FullscreenIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main chart area */}
      <div className="p-4 bg-card rounded-b-lg">
        <RealTimeChart
          symbol={selectedSymbol}
          interval={currentInterval}
          height={isFullscreen ? window.innerHeight - 250 : 600}
          onIntervalChange={setCurrentInterval}
        />
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-card text-xs text-muted-foreground mt-4 rounded-lg">
        <div className="flex items-center gap-4">
          <span>Market Status: Open</span>
          <span>Last Update: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Latency: ~50ms</span>
          <span>Data: Real-time</span>
        </div>
      </div>
    </div>
  );
};

export default TradingView;
