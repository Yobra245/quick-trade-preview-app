import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Area, 
  AreaChart, 
  Bar,
  BarChart,
  CartesianGrid, 
  Cell,
  ResponsiveContainer, 
  Tooltip,
  XAxis, 
  YAxis,
  Line,
  LineChart,
  Legend
} from 'recharts';
import { 
  ZoomIn, 
  ZoomOut,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "./ui/chart";
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CandlestickChart from './CandlestickChart';

export type ChartType = 'area' | 'line' | 'candle' | 'bar';
export type TimeframeType = '1s' | '5s' | '15s' | '30s' | '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d' | '3d' | '1w' | '1M' | '3M' | '6M' | '1y';

interface EnhancedChartProps {
  data: any[];
  symbol: string;
  defaultTimeframe?: TimeframeType;
  defaultChartType?: ChartType;
  height?: number;
  colorConfig?: any;
  allowChartTypeChange?: boolean;
  allowTimeframeChange?: boolean;
  allowZoom?: boolean;
  allowDownload?: boolean;
  valueFormatter?: (value: number) => string;
  onTimeframeChange?: (timeframe: TimeframeType) => void;
}

const timeframes: { value: TimeframeType; label: string; group: string }[] = [
  // Seconds
  { value: '1s', label: '1s', group: 'Seconds' },
  { value: '5s', label: '5s', group: 'Seconds' },
  { value: '15s', label: '15s', group: 'Seconds' },
  { value: '30s', label: '30s', group: 'Seconds' },
  
  // Minutes
  { value: '1m', label: '1m', group: 'Minutes' },
  { value: '5m', label: '5m', group: 'Minutes' },
  { value: '15m', label: '15m', group: 'Minutes' },
  { value: '30m', label: '30m', group: 'Minutes' },
  
  // Hours
  { value: '1h', label: '1h', group: 'Hours' },
  { value: '2h', label: '2h', group: 'Hours' },
  { value: '4h', label: '4h', group: 'Hours' },
  { value: '6h', label: '6h', group: 'Hours' },
  { value: '12h', label: '12h', group: 'Hours' },
  
  // Days
  { value: '1d', label: '1D', group: 'Days' },
  { value: '3d', label: '3D', group: 'Days' },
  { value: '1w', label: '1W', group: 'Days' },
  
  // Months/Years
  { value: '1M', label: '1M', group: 'Long Term' },
  { value: '3M', label: '3M', group: 'Long Term' },
  { value: '6M', label: '6M', group: 'Long Term' },
  { value: '1y', label: '1Y', group: 'Long Term' }
];

// Popular timeframes for quick access
const popularTimeframes: TimeframeType[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  symbol,
  defaultTimeframe = '1h',
  defaultChartType = 'area',
  height = 400,
  colorConfig,
  allowChartTypeChange = true,
  allowTimeframeChange = true,
  allowZoom = true,
  allowDownload = true,
  valueFormatter = (value: number) => value.toFixed(2),
  onTimeframeChange
}) => {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [timeframe, setTimeframe] = useState<TimeframeType>(defaultTimeframe);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Default color config if none provided
  const defaultColorConfig = {
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
    bar: {
      fill: "#3b82f6",
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

  const config = colorConfig || defaultColorConfig;
  
  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    
    // Format based on timeframe
    if (['1s', '5s', '15s', '30s'].includes(timeframe)) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } else if (['1m', '5m', '15m', '30m'].includes(timeframe)) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (['1h', '2h', '4h', '6h', '12h'].includes(timeframe)) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (['1d', '3d'].includes(timeframe)) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else if (['1w'].includes(timeframe)) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { year: '2-digit', month: 'short' });
    }
  };

  const formatYAxis = (value: number) => {
    return valueFormatter(value);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 3) setZoomLevel(prev => prev + 0.5);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) setZoomLevel(prev => prev - 0.5);
  };

  const handleTimeframeChange = (tf: TimeframeType) => {
    setTimeframe(tf);
    onTimeframeChange?.(tf);
  };

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  const handleDownload = () => {
    // Create a canvas from the chart and allow download
    const svgElement = document.querySelector(`.chart-${symbol.replace('/', '-')} svg`);
    if (!svgElement) return;
    
    // Convert SVG to canvas
    const canvas = document.createElement('canvas');
    canvas.width = svgElement.clientWidth * 2;
    canvas.height = svgElement.clientHeight * 2;
    
    const xml = new XMLSerializer().serializeToString(svgElement);
    const svg64 = btoa(xml);
    const b64Start = 'data:image/svg+xml;base64,';
    const image64 = b64Start + svg64;
    
    const img = new Image();
    img.onload = () => {
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement('a');
        link.download = `${symbol}-${timeframe}-chart.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = image64;
  };
  
  const renderChart = () => {
    const visibleData = zoomLevel !== 1 
      ? data.slice(0, Math.floor(data.length / zoomLevel)) 
      : data;
      
    switch (chartType) {
      case 'candle':
        return (
          <CandlestickChart
            data={visibleData}
            height={height}
            colorConfig={config}
            valueFormatter={valueFormatter}
          />
        );
      case 'area':
        return (
          <>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.area.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.area.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={config.grid.stroke} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              tick={{fontSize: 10}} 
              axisLine={{stroke: config.grid.stroke}}
              tickLine={{stroke: config.grid.stroke}}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{fontSize: 10}} 
              axisLine={{stroke: config.grid.stroke}}
              tickLine={{stroke: config.grid.stroke}}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke={config.area.stroke} 
              fillOpacity={1}
              fill={config.area.fill}
            />
            <Legend />
          </>
        );
      case 'line':
        return (
          <>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={config.grid.stroke} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              tick={{fontSize: 10}} 
              axisLine={{stroke: config.grid.stroke}}
              tickLine={{stroke: config.grid.stroke}}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{fontSize: 10}} 
              axisLine={{stroke: config.grid.stroke}}
              tickLine={{stroke: config.grid.stroke}}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke={config.line.stroke}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Legend />
          </>
        );
      case 'bar':
        return (
          <>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={config.grid.stroke} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              tick={{fontSize: 10}} 
              axisLine={{stroke: config.grid.stroke}}
              tickLine={{stroke: config.grid.stroke}}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{fontSize: 10}} 
              axisLine={{stroke: config.grid.stroke}}
              tickLine={{stroke: config.grid.stroke}}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="close">
              {visibleData.map((entry, index) => {
                const isPositive = index > 0 ? entry.close >= visibleData[index - 1].close : true;
                return (
                  <Cell 
                    key={`cell-${index}`}
                    fill={isPositive ? config.positive : config.negative}
                  />
                );
              })}
            </Bar>
            <Legend />
          </>
        );
      default:
        return null;
    }
  };
  
  const getChartComponent = () => {
    const visibleData = zoomLevel !== 1 ? data.slice(0, Math.floor(data.length / zoomLevel)) : data;
    
    if (chartType === 'candle') {
      return renderChart();
    }
    
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={visibleData}>
            {renderChart()}
          </AreaChart>
        );
      case 'line':
        return (
          <LineChart data={visibleData}>
            {renderChart()}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={visibleData}>
            {renderChart()}
          </BarChart>
        );
      default:
        return (
          <AreaChart data={visibleData}>
            {renderChart()}
          </AreaChart>
        );
    }
  };

  return (
    <Card className="bg-card border-border w-full">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">{symbol} Chart</h3>
          
          <div className="flex items-center space-x-2">
            {allowTimeframeChange && (
              <>
                {/* Popular timeframes */}
                <div className="hidden md:flex bg-accent/50 rounded-md">
                  {popularTimeframes.map(tf => (
                    <Button
                      key={tf}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "px-2 py-1 text-xs h-7",
                        timeframe === tf ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => handleTimeframeChange(tf)}
                    >
                      {timeframes.find(t => t.value === tf)?.label || tf}
                    </Button>
                  ))}
                </div>
                
                {/* All timeframes dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {['Seconds', 'Minutes', 'Hours', 'Days', 'Long Term'].map(group => (
                      <div key={group}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {group}
                        </div>
                        {timeframes
                          .filter(tf => tf.group === group)
                          .map(tf => (
                            <DropdownMenuItem 
                              key={tf.value}
                              onClick={() => handleTimeframeChange(tf.value)}
                              className={cn(
                                timeframe === tf.value && "bg-accent"
                              )}
                            >
                              {tf.label}
                            </DropdownMenuItem>
                          ))}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            <div className="flex items-center space-x-1">
              {allowZoom && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={handleZoomOut} 
                    disabled={zoomLevel <= 0.5}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7" 
                    onClick={handleZoomIn} 
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              
              {allowChartTypeChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleChartTypeChange('candle')}>
                      Candlestick
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleChartTypeChange('area')}>
                      Area Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleChartTypeChange('line')}>
                      Line Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleChartTypeChange('bar')}>
                      Bar Chart
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {allowDownload && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={handleDownload}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0" style={{ height: `${height}px` }}>
        {chartType === 'candle' ? (
          <div className={cn("w-full h-full chart-" + symbol.replace('/', '-'))}>
            {getChartComponent()}
          </div>
        ) : (
          <ChartContainer 
            config={config} 
            className={cn("w-full h-full chart-" + symbol.replace('/', '-'))}
          >
            {getChartComponent()}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedChart;
