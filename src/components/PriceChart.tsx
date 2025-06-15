import React, { useState } from 'react';
import EnhancedChart, { TimeframeType } from './EnhancedChart';
import { useAppContext } from '@/contexts/AppContext';
import { useLiveChartData } from '@/hooks/useLiveData';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, WifiOff } from 'lucide-react';

interface PriceChartProps {
  symbol: string;
  timeframe?: TimeframeType;
  height?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  symbol, 
  timeframe: initialTimeframe = '1h',
  height = 300
}) => {
  const { selectedMarketType } = useAppContext();
  const [currentTimeframe, setCurrentTimeframe] = useState<TimeframeType>(initialTimeframe);
  const { chartData, loading, error } = useLiveChartData(symbol, currentTimeframe);

  // Enhanced chart configuration based on market type
  const getColorConfig = () => {
    switch (selectedMarketType) {
      case 'forex':
        return {
          area: { stroke: "#22c55e", fill: "url(#colorGradient)" },
          line: { stroke: "#22c55e" },
          grid: { stroke: "#1f2937" },
          positive: "#22c55e",
          negative: "#ef4444"
        };
      case 'stocks':
        return {
          area: { stroke: "#3b82f6", fill: "url(#colorGradient)" },
          line: { stroke: "#3b82f6" },
          grid: { stroke: "#1f2937" },
          positive: "#22c55e",
          negative: "#ef4444"
        };
      default: // crypto
        return {
          area: { stroke: "#f59e0b", fill: "url(#colorGradient)" },
          line: { stroke: "#f59e0b" },
          grid: { stroke: "#1f2937" },
          positive: "#22c55e",
          negative: "#ef4444"
        };
    }
  };

  const colorConfig = getColorConfig();

  const formatValue = (value: number) => {
    if (selectedMarketType === 'forex') {
      return value.toFixed(4);
    }
    return value > 1000 ? 
      `${(value / 1000).toFixed(1)}k` : 
      value.toFixed(1);
  };

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setCurrentTimeframe(newTimeframe);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border w-full" style={{ height: `${height + 100}px` }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading live data for {symbol}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border w-full" style={{ height: `${height + 100}px` }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Failed to load live data</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-card border-border w-full" style={{ height: `${height + 100}px` }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No data available for {symbol}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <EnhancedChart 
      data={chartData}
      symbol={symbol}
      height={height}
      colorConfig={colorConfig}
      valueFormatter={formatValue}
      defaultChartType="candle"
      defaultTimeframe={currentTimeframe}
      onTimeframeChange={handleTimeframeChange}
    />
  );
};

export default PriceChart;
