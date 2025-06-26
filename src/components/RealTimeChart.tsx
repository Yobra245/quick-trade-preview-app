
import React, { useMemo, useState } from 'react';
import { useRealTimeChart } from '@/hooks/useRealTimeChart';
import { usePatternRecognition } from '@/hooks/usePatternRecognition';
import { ChartData } from '@/lib/types';
import { TimeframeType } from './EnhancedChart';
import PatternAlerts from './PatternAlerts';
import ChartLoadingState from './chart/ChartLoadingState';
import MainChartArea from './chart/MainChartArea';
import ChartSidePanel from './chart/ChartSidePanel';

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

  // Event handlers
  const handleToolSelect = (tool: string) => setSelectedTool(tool);
  const handleClearDrawings = () => setDrawingHistory([]);
  const handleUndo = () => setDrawingHistory(prev => prev.slice(0, -1));
  const handleRedo = () => {/* Implement redo logic */};
  const handleSettingsChange = (newSettings: Partial<ChartSettings>) => {
    setChartSettings(prev => ({ ...prev, ...newSettings }));
  };
  const handleZoomIn = () => console.log('Zoom in');
  const handleZoomOut = () => console.log('Zoom out');
  const handleResetZoom = () => console.log('Reset zoom');
  const handleToggleFullscreen = () => console.log('Toggle fullscreen');
  const handleDismissPattern = (patternId: string) => {
    setDismissedPatterns(prev => [...prev, patternId]);
  };
  const handlePlaceOrder = (order: any) => {
    console.log('Placing order:', order);
  };

  // Show loading or error states
  if ((loading && chartData.length === 0) || (error && chartData.length === 0)) {
    return <ChartLoadingState loading={loading} error={error} height={height} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Main Chart Area */}
      <MainChartArea
        symbol={symbol}
        chartData={chartData}
        currentPrice={currentPrice}
        previousPrice={previousPrice}
        height={height}
        interval={interval}
        connectionStatus={connectionStatus}
        activePatterns={activePatterns.length}
        selectedTool={selectedTool}
        drawingHistory={drawingHistory}
        chartSettings={chartSettings}
        onIntervalChange={onIntervalChange}
        onToolSelect={handleToolSelect}
        onClearDrawings={handleClearDrawings}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSettingsChange={handleSettingsChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Side Panel */}
      <ChartSidePanel
        symbol={symbol}
        currentPrice={currentPrice}
        chartData={chartData}
        patterns={activePatterns}
        showIndicators={chartSettings.showIndicators}
        onPlaceOrder={handlePlaceOrder}
      />

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
  
  return intervals[interval] || 60000;
}

export default RealTimeChart;
