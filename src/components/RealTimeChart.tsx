
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealTimeChart } from '@/hooks/useRealTimeChart';
import { ChartData } from '@/lib/types';
import EnhancedChart, { TimeframeType } from './EnhancedChart';
import LivePriceOverlay from './LivePriceOverlay';
import VolumeProfile from './VolumeProfile';
import TechnicalIndicatorsPanel from './TechnicalIndicatorsPanel';
import { Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeChartProps {
  symbol: string;
  interval: TimeframeType;
  height?: number;
  onIntervalChange?: (interval: TimeframeType) => void;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  symbol,
  interval,
  height = 500,
  onIntervalChange
}) => {
  const {
    historicalData,
    currentCandle,
    currentPrice,
    loading,
    error,
    connectionStatus
  } = useRealTimeChart({
    symbol,
    interval,
    enabled: true,
    historyLimit: 200
  });

  // Combine historical data with current forming candle
  const chartData = useMemo(() => {
    const data = [...historicalData];
    
    if (currentCandle) {
      // Check if we need to replace the last candle or add a new one
      const lastCandle = data[data.length - 1];
      const timeDiff = currentCandle.timestamp - (lastCandle?.timestamp || 0);
      
      // If current candle is from the same time period, replace the last one
      // Otherwise, add as new candle
      if (lastCandle && timeDiff < getIntervalMs(interval)) {
        data[data.length - 1] = currentCandle;
      } else {
        data.push(currentCandle);
      }
    }
    
    return data;
  }, [historicalData, currentCandle, interval]);

  // Get previous price for comparison
  const previousPrice = useMemo(() => {
    if (historicalData.length < 2) return currentPrice;
    return historicalData[historicalData.length - 2]?.close || currentPrice;
  }, [historicalData, currentPrice]);

  // Get connection status styling
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

  if (loading && chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading live chart data...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-accent rounded w-3/4"></div>
                <div className="h-6 bg-accent rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="text-center">
              <p className="text-sm font-medium">Failed to load chart data</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Chart Area */}
      <div className="lg:col-span-3">
        <Card className="bg-card border-border relative">
          <CardHeader className="border-b py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-lg">{symbol}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                {getConnectionBadge()}
                <div className="text-xs text-muted-foreground">
                  {chartData.length} candles
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 relative">
            {/* Live Price Overlay */}
            <LivePriceOverlay
              price={currentPrice}
              previousPrice={previousPrice}
              symbol={symbol}
              isConnected={connectionStatus === 'connected'}
            />
            
            <EnhancedChart
              data={chartData}
              symbol={symbol}
              height={height}
              defaultChartType="candle"
              defaultTimeframe={interval}
              onTimeframeChange={onIntervalChange}
              allowChartTypeChange={true}
              allowTimeframeChange={true}
              allowZoom={true}
              allowDownload={true}
              colorConfig={{
                area: { stroke: "#f59e0b", fill: "url(#colorGradient)" },
                line: { stroke: "#f59e0b" },
                grid: { stroke: "#1f2937" },
                positive: "#22c55e",
                negative: "#ef4444"
              }}
              valueFormatter={(value: number) => `$${value.toFixed(2)}`}
            />
          </CardContent>
          
          {/* Volume Profile */}
          <div className="border-t">
            <VolumeProfile data={chartData} height={80} />
          </div>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="space-y-4">
        {/* Technical Indicators Panel */}
        <TechnicalIndicatorsPanel 
          data={chartData}
          currentPrice={currentPrice}
        />
        
        {/* Market Stats */}
        <Card>
          <CardHeader className="pb-3">
            <h4 className="text-sm font-semibold">Market Stats</h4>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">24h Volume</span>
              <span className="font-mono">
                {chartData.length > 0 ? 
                  `${(chartData.reduce((sum, c) => sum + c.volume, 0) / 1000000).toFixed(2)}M` 
                  : '0.00M'
                }
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">24h High</span>
              <span className="font-mono text-green-500">
                ${chartData.length > 0 ? Math.max(...chartData.map(c => c.high)).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">24h Low</span>
              <span className="font-mono text-red-500">
                ${chartData.length > 0 ? Math.min(...chartData.map(c => c.low)).toFixed(2) : '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get interval in milliseconds
function getIntervalMs(interval: string): number {
  const intervals: Record<string, number> = {
    '1s': 1000,
    '5s': 5000,
    '15s': 15000,
    '30s': 30000,
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '30m': 1800000,
    '1h': 3600000,
    '2h': 7200000,
    '4h': 14400000,
    '6h': 21600000,
    '12h': 43200000,
    '1d': 86400000,
    '3d': 259200000,
    '1w': 604800000,
    '1M': 2592000000
  };
  
  return intervals[interval] || 60000; // Default to 1 minute
}

export default RealTimeChart;
