
import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartData } from '@/lib/types';

interface CandlestickChartProps {
  data: ChartData[];
  height: number;
  colorConfig: any;
  valueFormatter: (value: number) => string;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  height,
  colorConfig,
  valueFormatter
}) => {
  // Transform data for candlestick visualization
  const candlestickData = data.map(candle => {
    const isPositive = candle.close >= candle.open;
    return {
      ...candle,
      // For the body of the candle
      bodyLow: Math.min(candle.open, candle.close),
      bodyHigh: Math.max(candle.open, candle.close),
      bodyHeight: Math.abs(candle.close - candle.open),
      // For the wicks
      upperWick: candle.high - Math.max(candle.open, candle.close),
      lowerWick: Math.min(candle.open, candle.close) - candle.low,
      isPositive,
      // Combined values for easier rendering
      wickLow: candle.low,
      wickHigh: candle.high
    };
  });

  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const CustomCandlestick = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const candle = payload;
    const candleWidth = Math.max(width * 0.6, 2);
    const wickX = x + width / 2;
    const bodyX = x + (width - candleWidth) / 2;

    // Calculate positions
    const scale = height / (Math.max(...data.map(d => d.high)) - Math.min(...data.map(d => d.low)));
    const minPrice = Math.min(...data.map(d => d.low));
    
    const highY = y + height - (candle.high - minPrice) * scale;
    const lowY = y + height - (candle.low - minPrice) * scale;
    const openY = y + height - (candle.open - minPrice) * scale;
    const closeY = y + height - (candle.close - minPrice) * scale;

    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = bodyBottom - bodyTop;

    const color = candle.isPositive ? colorConfig.positive : colorConfig.negative;

    return (
      <g>
        {/* Upper wick */}
        <line
          x1={wickX}
          y1={highY}
          x2={wickX}
          y2={bodyTop}
          stroke={color}
          strokeWidth={1}
        />
        {/* Lower wick */}
        <line
          x1={wickX}
          y1={bodyBottom}
          x2={wickX}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        {/* Candle body */}
        <rect
          x={bodyX}
          y={bodyTop}
          width={candleWidth}
          height={Math.max(bodyHeight, 1)}
          fill={candle.isPositive ? colorConfig.positive : colorConfig.negative}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{new Date(label).toLocaleString()}</p>
          <div className="space-y-1 mt-2">
            <p className="text-xs">Open: {valueFormatter(data.open)}</p>
            <p className="text-xs">High: {valueFormatter(data.high)}</p>
            <p className="text-xs">Low: {valueFormatter(data.low)}</p>
            <p className="text-xs">Close: {valueFormatter(data.close)}</p>
            <p className="text-xs">Volume: {data.volume?.toLocaleString()}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={candlestickData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colorConfig.grid.stroke} />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatXAxis}
          tick={{ fontSize: 10 }} 
          axisLine={{ stroke: colorConfig.grid.stroke }}
          tickLine={{ stroke: colorConfig.grid.stroke }}
        />
        <YAxis 
          tickFormatter={valueFormatter}
          tick={{ fontSize: 10 }} 
          axisLine={{ stroke: colorConfig.grid.stroke }}
          tickLine={{ stroke: colorConfig.grid.stroke }}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="bodyHeight" shape={<CustomCandlestick />}>
          {candlestickData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={entry.isPositive ? colorConfig.positive : colorConfig.negative}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;
