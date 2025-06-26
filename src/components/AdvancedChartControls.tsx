
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize,
  Grid3X3,
  Crosshair,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface ChartSettings {
  showGrid: boolean;
  showCrosshair: boolean;
  showVolume: boolean;
  showIndicators: boolean;
  chartStyle: 'candlestick' | 'line' | 'area';
  colorScheme: 'dark' | 'light' | 'custom';
}

interface AdvancedChartControlsProps {
  settings: ChartSettings;
  onSettingsChange: (settings: Partial<ChartSettings>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const AdvancedChartControls: React.FC<AdvancedChartControlsProps> = ({
  settings,
  onSettingsChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  isFullscreen
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="absolute top-4 left-4 z-20 w-64 bg-card/95 backdrop-blur-sm border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Chart Controls</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onZoomIn} className="h-7 px-2">
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onZoomOut} className="h-7 px-2">
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onResetZoom} className="h-7 px-2">
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleFullscreen} className="h-7 px-2">
              <Maximize className="h-3 w-3" />
            </Button>
          </div>

          {/* Display Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-3 w-3" />
                <Label htmlFor="show-grid" className="text-xs">Grid</Label>
              </div>
              <Switch
                id="show-grid"
                checked={settings.showGrid}
                onCheckedChange={(checked) => onSettingsChange({ showGrid: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="h-3 w-3" />
                <Label htmlFor="show-crosshair" className="text-xs">Crosshair</Label>
              </div>
              <Switch
                id="show-crosshair"
                checked={settings.showCrosshair}
                onCheckedChange={(checked) => onSettingsChange({ showCrosshair: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                <Label htmlFor="show-volume" className="text-xs">Volume</Label>
              </div>
              <Switch
                id="show-volume"
                checked={settings.showVolume}
                onCheckedChange={(checked) => onSettingsChange({ showVolume: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                <Label htmlFor="show-indicators" className="text-xs">Indicators</Label>
              </div>
              <Switch
                id="show-indicators"
                checked={settings.showIndicators}
                onCheckedChange={(checked) => onSettingsChange({ showIndicators: checked })}
              />
            </div>
          </div>

          {/* Chart Style */}
          <div className="space-y-2">
            <Label className="text-xs">Chart Style</Label>
            <div className="grid grid-cols-3 gap-1">
              {(['candlestick', 'line', 'area'] as const).map((style) => (
                <Button
                  key={style}
                  variant={settings.chartStyle === style ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onSettingsChange({ chartStyle: style })}
                  className="h-7 text-xs capitalize"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedChartControls;
