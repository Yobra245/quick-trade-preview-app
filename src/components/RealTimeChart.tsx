import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealTimeChart } from '@/hooks/useRealTimeChart';
import { ChartData } from '@/lib/types';
import EnhancedChart, { TimeframeType } from './EnhancedChart';
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

  // Format current price with color indication
  const formatPrice = (price: number) => {
    if (!price) return '0.00';
    
    // Determine color based on recent price movement
    const lastHistoricalPrice = historicalData[historicalData.length - 1]?.close || price;
    const isUp = price >= lastHistoricalPrice;
    
    return (
      <span className={cn(
        "font-mono font-semibold text-lg",
        isUp ? "text-green-500" : "text-red-500"
      )}>
        ${price.toFixed(2)}
      </span>
    );
  };

  if (loading && chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading live chart data...</p>
          </div>
        </CardContent>
      </Card>
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
    <Card className="bg-card border-border">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-lg">{symbol}</h3>
            {formatPrice(currentPrice)}
          </div>
          
          <div className="flex items-center gap-2">
            {getConnectionBadge()}
            <div className="text-xs text-muted-foreground">
              {chartData.length} candles
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
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
        
        {/* Live price overlay */}
        {connectionStatus === 'connected' && currentPrice > 0 && (
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div className="text-xs text-muted-foreground">Live Price</div>
              <div className="font-mono font-bold text-primary">
                ${currentPrice.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
