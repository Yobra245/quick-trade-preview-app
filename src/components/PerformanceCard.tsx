
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  LabelList, 
  ResponsiveContainer, 
  XAxis, 
  YAxis 
} from 'recharts';
import { PerformanceMetrics } from '@/lib/types';
import { ChartLine, CircleDollarSign, TrendingUp } from 'lucide-react';

interface PerformanceCardProps {
  data: PerformanceMetrics;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ data }) => {
  const chartData = [
    { name: "Win Rate", value: data.winRate },
    { name: "P. Factor", value: data.profitFactor * 10 }, // Scale for visibility
    { name: "Avg. Profit", value: data.averageProfit * 5 }, // Scale for visibility
    { name: "Avg. Loss", value: Math.abs(data.averageLoss) * 5 }, // Scale for visibility
  ];
  
  const statsConfig = {
    bar: {
      theme: {
        light: "#3b82f6",
        dark: "#3b82f6",
      },
    },
  };

  // Fixed formatter function to safely check if the name exists and handle undefined cases
  const labelFormatter = (value: number, name: string) => {
    if (name === "P. Factor") return (value / 10).toFixed(1);
    if (name === "Avg. Profit" || name === "Avg. Loss") return (value / 5).toFixed(1) + '%';
    return value.toFixed(1) + '%';
  };

  return (
    <Card className="bg-black/40 border border-gray-800">
      <CardHeader className="border-b border-gray-800 py-3 px-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Performance</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Last 30 days</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/30 p-3 rounded-lg flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <CircleDollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-gray-400">Total Profit</span>
            </div>
            <span className="text-lg font-semibold text-profit">+{data.totalProfit}%</span>
          </div>
          
          <div className="bg-gray-800/30 p-3 rounded-lg flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-gray-400">Win Rate</span>
            </div>
            <span className="text-lg font-semibold">{data.winRate}%</span>
          </div>
          
          <div className="bg-gray-800/30 p-3 rounded-lg flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <ChartLine className="h-4 w-4 text-primary" />
              <span className="text-xs text-gray-400">Total Trades</span>
            </div>
            <span className="text-lg font-semibold">{data.totalTrades}</span>
          </div>
        </div>

        <div className="h-40">
          <ChartContainer config={statsConfig}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={{ stroke: '#1f2937' }}
                tickLine={{ stroke: '#1f2937' }}
              />
              <YAxis 
                hide={true}
                domain={[0, 100]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  fill="#9ca3af"
                  fontSize={10}
                  // Fixed: Use the proper formatter function with explicit typing
                  formatter={(value: number, entry: any) => {
                    // Safety check to ensure entry and entry.payload exist
                    if (!entry || !entry.payload || !entry.payload.name) {
                      return value.toFixed(1) + '%'; // Default fallback
                    }
                    
                    const name = entry.payload.name;
                    return labelFormatter(value, name);
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceCard;
