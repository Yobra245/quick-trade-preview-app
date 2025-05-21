
import React from 'react';
import EnhancedChart from './EnhancedChart';
import { mockChartData } from '@/lib/mockData';

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
  // Get mock data for the selected symbol
  const chartData = mockChartData[symbol as keyof typeof mockChartData] || [];

  // Enhanced chart configuration
  const colorConfig = {
    area: {
      stroke: "#3b82f6",
      fill: "url(#colorGradient)",
      theme: {
        light: "rgba(59, 130, 246, 0.15)",
        dark: "rgba(59, 130, 246, 0.15)",
      },
    },
    line: {
      stroke: "#3b82f6",
      theme: {
        light: "#3b82f6",
        dark: "#3b82f6",
      },
    },
    grid: {
      stroke: "#1f2937",
      theme: {
        light: "#E5E7EB",
        dark: "#1f2937",
      },
    },
    positive: "#22c55e",
    negative: "#ef4444"
  };

  const formatValue = (value: number) => {
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
