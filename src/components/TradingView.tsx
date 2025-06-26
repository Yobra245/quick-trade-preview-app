
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
  Activity,
  Zap,
  Target,
  AlertTriangle
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
  const [showAdvancedStats, setShowAdvancedStats] = useState(true);

  // Popular trading pairs categorized
  const spotPairs = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 
    'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'AVAX/USDT'
  ];

  const defiTokens = [
    'UNI/USDT', 'LINK/USDT', 'AAVE/USDT', 'COMP/USDT'
  ];

  // Quick interval selector with more professional options
  const quickIntervals: TimeframeType[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d'];

  const handleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
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
      {/* Professional Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg shadow-sm">
        <div className="flex items-center gap-6">
          {/* Symbol selector with categories */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <select 
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
              >
                <optgroup label="Spot Trading">
                  {spotPairs.map(pair => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </optgroup>
                <optgroup label="DeFi Tokens">
                  {defiTokens.map(pair => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </optgroup>
              </select>
              
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Spot
                </Badge>
                <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
          </div>

          {/* Professional interval selector */}
          <div className="flex items-center gap-1 bg-accent/30 rounded-lg p-1 border">
            {quickIntervals.map(intervalOption => (
              <Button
                key={intervalOption}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-1.5 text-xs h-7 font-medium transition-all",
                  currentInterval === intervalOption 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                onClick={() => setCurrentInterval(intervalOption)}
              >
                {intervalOption}
              </Button>
            ))}
          </div>

          {/* Pattern alerts indicator */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
            >
              <Target className="w-4 h-4 mr-1" />
              Patterns
              <Badge variant="secondary" className="ml-1 text-[10px] bg-orange-500/10 text-orange-500">
                3
              </Badge>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Professional trading indicators */}
          {showAdvancedStats && (
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold">+2.34%</span>
                </div>
                <span className="text-xs text-muted-foreground">24h Change</span>
              </div>
              
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Volume2 className="w-4 h-4" />
                  <span className="font-bold">1.2B</span>
                </div>
                <span className="text-xs text-muted-foreground">24h Volume</span>
              </div>
              
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold">$43,250</span>
                </div>
                <span className="text-xs text-muted-foreground">24h High</span>
              </div>
            </div>
          )}

          {/* Professional controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              title="Toggle Statistics"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
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

      {/* Professional Chart Area */}
      <div className="bg-card rounded-b-lg border-x border-b">
        <RealTimeChart
          symbol={selectedSymbol}
          interval={currentInterval}
          height={isFullscreen ? window.innerHeight - 300 : 650}
          onIntervalChange={setCurrentInterval}
        />
      </div>

      {/* Professional Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-card/50 text-xs text-muted-foreground mt-4 rounded-lg border backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">Market Status: Open</span>
          </div>
          <span>Last Update: {new Date().toLocaleTimeString()}</span>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Risk Level: Moderate</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <span>Latency: ~45ms</span>
          <span>Data Feed: Binance WebSocket</span>
          <span className="font-medium text-primary">Professional Mode</span>
        </div>
      </div>
    </div>
  );
};

export default TradingView;
