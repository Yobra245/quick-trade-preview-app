
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
  ChevronLeft, 
  ChevronRight, 
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

export type ChartType = 'area' | 'line' | 'candle' | 'bar';
export type TimeframeType = '15m' | '1h' | '4h' | '1d' | '1w';

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
}

const timeframes: TimeframeType[] = ['15m', '1h', '4h', '1d', '1w'];

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
  valueFormatter = (value: number) => value.toFixed(2)
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
    return new Date(tickItem).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
    // In a real app, this would fetch new data for the timeframe
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
    // Use a subset of data based on zoom level
    const visibleData = zoomLevel !== 1 
      ? data.slice(0, Math.floor(data.length / zoomLevel)) 
      : data;
      
    switch (chartType) {
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
            {chartType === 'area' && <Legend />}
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
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={zoomLevel !== 1 ? data.slice(0, Math.floor(data.length / zoomLevel)) : data}>
            {renderChart()}
          </AreaChart>
        );
      case 'line':
        return (
          <LineChart data={zoomLevel !== 1 ? data.slice(0, Math.floor(data.length / zoomLevel)) : data}>
            {renderChart()}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={zoomLevel !== 1 ? data.slice(0, Math.floor(data.length / zoomLevel)) : data}>
            {renderChart()}
          </BarChart>
        );
      default:
        return (
          <AreaChart data={zoomLevel !== 1 ? data.slice(0, Math.floor(data.length / zoomLevel)) : data}>
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
              <div className="flex bg-accent/50 rounded-md">
                {timeframes.map(tf => (
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
                    {tf}
                  </Button>
                ))}
              </div>
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
                    <DropdownMenuItem onClick={() => setChartType('area')}>
                      Area Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChartType('line')}>
                      Line Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChartType('bar')}>
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
        <ChartContainer 
          config={config} 
          className={cn("w-full h-full chart-" + symbol.replace('/', '-'))}
        >
          {getChartComponent()}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EnhancedChart;
