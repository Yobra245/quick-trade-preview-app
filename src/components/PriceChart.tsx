
import React from 'react';
import EnhancedChart from './EnhancedChart';
import { mockChartData } from '@/lib/mockData';
import { useAppContext } from '@/contexts/AppContext';

interface PriceChartProps {
  symbol: string;
  timeframe?: string;
  height?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  symbol, 
  timeframe = '1h',
  height = 300
}) => {
  const { selectedMarketType } = useAppContext();
  
  // Get mock data for the selected symbol
  const chartData = mockChartData[symbol as keyof typeof mockChartData] || mockChartData['BTC/USDT'];

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

  return (
    <EnhancedChart 
      data={chartData}
      symbol={symbol}
      height={height}
      colorConfig={colorConfig}
      valueFormatter={formatValue}
      defaultChartType="area"
    />
  );
};

export default PriceChart;
