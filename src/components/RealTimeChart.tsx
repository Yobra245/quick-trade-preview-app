
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealTimeChart } from '@/hooks/useRealTimeChart';
import { usePatternRecognition } from '@/hooks/usePatternRecognition';
import { ChartData } from '@/lib/types';
import EnhancedChart, { TimeframeType } from './EnhancedChart';
import LivePriceOverlay from './LivePriceOverlay';
import VolumeProfile from './VolumeProfile';
import TechnicalIndicatorsPanel from './TechnicalIndicatorsPanel';
import DrawingTools from './DrawingTools';
import PatternAlerts from './PatternAlerts';
import AdvancedChartControls from './AdvancedChartControls';
import { Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeChartProps {
  symbol: string;
  interval: TimeframeType;
  height?: number;
  onIntervalChange?: (interval: TimeframeType) => void;
}

interface ChartSettings {
  showGrid: boolean;
  showCrosshair: boolean;
  showVolume: boolean;
  showIndicators: boolean;
  chartStyle: 'candlestick' | 'line' | 'area';
  colorScheme: 'dark' | 'light' | 'custom';
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  symbol,
  interval,
  height = 500,
  onIntervalChange
}) => {
  const [selectedTool, setSelectedTool] = useState('cursor');
  const [drawingHistory, setDrawingHistory] = useState<any[]>([]);
  const [dismissedPatterns, setDismissedPatterns] = useState<string[]>([]);
  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    showGrid: true,
    showCrosshair: true,
    showVolume: true,
    showIndicators: true,
    chartStyle: 'candlestick',
    colorScheme: 'dark'
  });

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
      const lastCandle = data[data.length - 1];
      const timeDiff = currentCandle.timestamp - (lastCandle?.timestamp || 0);
      
      if (lastCandle && timeDiff < getIntervalMs(interval)) {
        data[data.length - 1] = currentCandle;
      } else {
        data.push(currentCandle);
      }
    }
    
    return data;
  }, [historicalData, currentCandle, interval]);

  // Pattern recognition
  const patterns = usePatternRecognition(chartData);
  const activePatterns = patterns.filter(p => !dismissedPatterns.includes(p.id));

  // Get previous price for comparison
  const previousPrice = useMemo(() => {
    if (historicalData.length < 2) return currentPrice;
    return historicalData[historicalData.length - 2]?.close || currentPrice;
  }, [historicalData, currentPrice]);

  // Drawing tools handlers
  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const handleClearDrawings = () => {
    setDrawingHistory([]);
  };

  const handleUndo = () => {
    setDrawingHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    // Implement redo logic
  };

  // Chart controls handlers
  const handleSettingsChange = (newSettings: Partial<ChartSettings>) => {
    setChartSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleZoomIn = () => {
    // Implement zoom in logic
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    // Implement zoom out logic
    console.log('Zoom out');
  };

  const handleResetZoom = () => {
    // Implement reset zoom logic
    console.log('Reset zoom');
  };

  const handleToggleFullscreen = () => {
    // Implement fullscreen toggle
    console.log('Toggle fullscreen');
  };

  // Pattern alert handlers
  const handleDismissPattern = (patternId: string) => {
    setDismissedPatterns(prev => [...prev, patternId]);
  };

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

  if (loading && chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading professional trading chart...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-accent rounded w-3/4"></div>
                <div className="h-6 bg-accent rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="text-center">
              <p className="text-sm font-medium">Failed to load professional chart</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Chart Area */}
      <div className="lg:col-span-3">
        <Card className="bg-card border-border relative overflow-hidden">
          <CardHeader className="border-b py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-lg">{symbol}</h3>
                <Badge variant="outline" className="text-xs">
                  Professional Trading
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {getConnectionBadge()}
                <div className="text-xs text-muted-foreground">
                  {chartData.length} candles • {activePatterns.length} patterns
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 relative">
            {/* Live Price Overlay */}
            <LivePriceOverlay
              price={currentPrice}
              previousPrice={previousPrice}
              symbol={symbol}
              isConnected={connectionStatus === 'connected'}
            />
            
            {/* Drawing Tools */}
            <DrawingTools
              onToolSelect={handleToolSelect}
              selectedTool={selectedTool}
              onClear={handleClearDrawings}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={drawingHistory.length > 0}
              canRedo={false}
            />
            
            {/* Advanced Chart Controls */}
            <AdvancedChartControls
              settings={chartSettings}
              onSettingsChange={handleSettingsChange}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              onToggleFullscreen={handleToggleFullscreen}
              isFullscreen={false}
            />
            
            <EnhancedChart
              data={chartData}
              symbol={symbol}
              height={height}
              defaultChartType={chartSettings.chartStyle === 'candlestick' ? 'candle' : chartSettings.chartStyle}
              defaultTimeframe={interval}
              onTimeframeChange={onIntervalChange}
              allowChartTypeChange={true}
              allowTimeframeChange={true}
              allowZoom={true}
              allowDownload={true}
              colorConfig={{
                area: { stroke: "#f59e0b", fill: "url(#colorGradient)" },
                line: { stroke: "#f59e0b" },
                grid: { stroke: chartSettings.showGrid ? "#1f2937" : "transparent" },
                positive: "#22c55e",
                negative: "#ef4444"
              }}
              valueFormatter={(value: number) => `$${value.toFixed(2)}`}
            />
          </CardContent>
          
          {/* Volume Profile */}
          {chartSettings.showVolume && (
            <div className="border-t">
              <VolumeProfile data={chartData} height={80} />
            </div>
          )}
        </Card>
      </div>

      {/* Side Panel */}
      <div className="space-y-4">
        {/* Technical Indicators Panel */}
        {chartSettings.showIndicators && (
          <TechnicalIndicatorsPanel 
            data={chartData}
            currentPrice={currentPrice}
          />
        )}
        
        {/* Patterns Summary */}
        <Card>
          <CardHeader className="pb-3">
            <h4 className="text-sm font-semibold">Pattern Analysis</h4>
          </CardHeader>
          <CardContent className="space-y-2">
            {activePatterns.length > 0 ? (
              activePatterns.slice(0, 3).map((pattern) => (
                <div key={pattern.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{pattern.name}</span>
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px]",
                        pattern.type === 'bullish' && "bg-green-500/10 text-green-500",
                        pattern.type === 'bearish' && "bg-red-500/10 text-red-500"
                      )}
                    >
                      {pattern.signal}
                    </Badge>
                    <span className="font-mono text-[10px]">
                      {(pattern.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No patterns detected</p>
            )}
          </CardContent>
        </Card>
        
        {/* Market Stats */}
        <Card>
          <CardHeader className="pb-3">
            <h4 className="text-sm font-semibold">Market Stats</h4>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">24h Volume</span>
              <span className="font-mono">
                {chartData.length > 0 ? 
                  `${(chartData.reduce((sum, c) => sum + c.volume, 0) / 1000000).toFixed(2)}M` 
                  : '0.00M'
                }
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">24h High</span>
              <span className="font-mono text-green-500">
                ${chartData.length > 0 ? Math.max(...chartData.map(c => c.high)).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">24h Low</span>
              <span className="font-mono text-red-500">
                ${chartData.length > 0 ? Math.min(...chartData.map(c => c.low)).toFixed(2) : '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Alerts - Fixed Position */}
      <PatternAlerts
        patterns={activePatterns}
        onDismiss={handleDismissPattern}
      />
    </div>
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
