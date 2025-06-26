
import React, { useState } from 'react';
import RealTimeChart from './RealTimeChart';
import { TimeframeType } from './EnhancedChart';
import { useAppContext } from '@/contexts/AppContext';
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

  const formatValue = (value: number) => {
    if (selectedMarketType === 'forex') {
      return value.toFixed(4);
    }
    return value > 1000 ? 
      `${(value / 1000).toFixed(1)}k` : 
      value.toFixed(2);
  };

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setCurrentTimeframe(newTimeframe);
  };

  return (
    <RealTimeChart
      symbol={symbol}
      interval={currentTimeframe}
      height={height}
      onIntervalChange={handleTimeframeChange}
    />
  );
};

export default PriceChart;
