
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartData } from '@/lib/types';
import { TimeframeType } from '../EnhancedChart';
import EnhancedChart from '../EnhancedChart';
import LivePriceOverlay from '../LivePriceOverlay';
import DrawingTools from '../DrawingTools';
import AdvancedChartControls from '../AdvancedChartControls';
import VolumeProfile from '../VolumeProfile';
import ChartHeader from './ChartHeader';

interface ChartSettings {
  showGrid: boolean;
  showCrosshair: boolean;
  showVolume: boolean;
  showIndicators: boolean;
  chartStyle: 'candlestick' | 'line' | 'area';
  colorScheme: 'dark' | 'light' | 'custom';
}

interface MainChartAreaProps {
  symbol: string;
  chartData: ChartData[];
  currentPrice: number;
  previousPrice: number;
  height: number;
  interval: TimeframeType;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  activePatterns: number;
  selectedTool: string;
  drawingHistory: any[];
  chartSettings: ChartSettings;
  onIntervalChange?: (interval: TimeframeType) => void;
  onToolSelect: (tool: string) => void;
  onClearDrawings: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSettingsChange: (settings: Partial<ChartSettings>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
}

const MainChartArea: React.FC<MainChartAreaProps> = ({
  symbol,
  chartData,
  currentPrice,
  previousPrice,
  height,
  interval,
  connectionStatus,
  activePatterns,
  selectedTool,
  drawingHistory,
  chartSettings,
  onIntervalChange,
  onToolSelect,
  onClearDrawings,
  onUndo,
  onRedo,
  onSettingsChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen
}) => {
  return (
    <div className="lg:col-span-3">
      <Card className="bg-card border-border relative overflow-hidden">
        <CardHeader className="border-b py-3 px-4">
          <ChartHeader
            symbol={symbol}
            connectionStatus={connectionStatus}
            activePatterns={activePatterns}
            candleCount={chartData.length}
          />
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
            onToolSelect={onToolSelect}
            selectedTool={selectedTool}
            onClear={onClearDrawings}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={drawingHistory.length > 0}
            canRedo={false}
          />
          
          {/* Advanced Chart Controls */}
          <AdvancedChartControls
            settings={chartSettings}
            onSettingsChange={onSettingsChange}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onResetZoom={onResetZoom}
            onToggleFullscreen={onToggleFullscreen}
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
  );
};

export default MainChartArea;
