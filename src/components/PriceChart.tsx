
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  ChartContainer,
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { CryptoAsset } from '@/lib/types';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Tooltip
} from 'recharts';
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

  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatYAxis = (value: number) => {
    return value > 1000 ? 
      `${(value / 1000).toFixed(1)}k` : 
      value.toFixed(1);
  };

  const config = {
    line: {
      stroke: "#3b82f6",
      strokeWidth: 2,
      theme: {
        light: "#3b82f6",
        dark: "#3b82f6", 
      },
    },
    area: {
      fill: "url(#colorGradient)",
      theme: {
        light: "rgba(59, 130, 246, 0.15)",
        dark: "rgba(59, 130, 246, 0.15)",
      },
    },
    grid: {
      stroke: "#1f2937",
      theme: {
        light: "#1f2937",
        dark: "#1f2937",
      },
    }
  };

  return (
    <Card className="bg-black/40 border border-gray-800 h-full">
      <CardHeader className="border-b border-gray-800 py-3 px-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">{symbol} Chart</h3>
          <div className="flex bg-gray-800/50 rounded-md">
            <button className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white focus:outline-none">
              15m
            </button>
            <button className="px-2 py-1 text-xs font-medium bg-primary rounded-md text-white focus:outline-none">
              1h
            </button>
            <button className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white focus:outline-none">
              4h
            </button>
            <button className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white focus:outline-none">
              1d
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[300px]">
        <ChartContainer config={config} className="w-full h-full">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#1f2937" 
            />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              tick={{fill: '#9ca3af', fontSize: 10}} 
              axisLine={{stroke: '#1f2937'}}
              tickLine={{stroke: '#1f2937'}}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{fill: '#9ca3af', fontSize: 10}} 
              axisLine={{stroke: '#1f2937'}}
              tickLine={{stroke: '#1f2937'}}
              domain={['dataMin', 'dataMax']}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke="#3b82f6" 
              fillOpacity={1}
              fill="url(#colorGradient)" 
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
