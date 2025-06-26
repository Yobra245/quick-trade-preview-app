
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Palette, 
  Grid3X3, 
  Eye, 
  EyeOff,
  Crosshair,
  MousePointer,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [showSettings, setShowSettings] = useState(false);

  const chartStyles = [
    { id: 'candlestick', name: 'Candlestick', icon: '📊' },
    { id: 'line', name: 'Line', icon: '📈' },
    { id: 'area', name: 'Area', icon: '📉' }
  ] as const;

  const colorSchemes = [
    { id: 'dark', name: 'Dark', color: '#000000' },
    { id: 'light', name: 'Light', color: '#ffffff' },
    { id: 'custom', name: 'Custom', color: '#1f2937' }
  ] as const;

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
      {/* Main controls */}
      <Card className="bg-card/95 backdrop-blur-sm border border-border">
        <CardContent className="p-2">
          <div className="flex items-center gap-1">
            {/* Zoom controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomIn}
              className="h-8 w-8 p-0"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomOut}
              className="h-8 w-8 p-0"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetZoom}
              className="h-8 w-8 p-0"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Display toggles */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSettingsChange({ showGrid: !settings.showGrid })}
              className={cn(
                "h-8 w-8 p-0",
                settings.showGrid && "bg-primary/20 text-primary"
              )}
              title="Toggle Grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSettingsChange({ showCrosshair: !settings.showCrosshair })}
              className={cn(
                "h-8 w-8 p-0",
                settings.showCrosshair && "bg-primary/20 text-primary"
              )}
              title="Toggle Crosshair"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSettingsChange({ showVolume: !settings.showVolume })}
              className={cn(
                "h-8 w-8 p-0",
                settings.showVolume && "bg-primary/20 text-primary"
              )}
              title="Toggle Volume"
            >
              {settings.showVolume ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Settings toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "h-8 w-8 p-0",
                showSettings && "bg-primary/20 text-primary"
              )}
              title="Chart Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Extended settings panel */}
      {showSettings && (
        <Card className="bg-card/95 backdrop-blur-sm border border-border w-64">
          <CardContent className="p-3 space-y-3">
            {/* Chart Style */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Chart Style</h4>
              <div className="flex gap-1">
                {chartStyles.map((style) => (
                  <Button
                    key={style.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSettingsChange({ chartStyle: style.id })}
                    className={cn(
                      "h-8 px-2 text-xs",
                      settings.chartStyle === style.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    <span className="mr-1">{style.icon}</span>
                    {style.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Theme</h4>
              <div className="flex gap-1">
                {colorSchemes.map((scheme) => (
                  <Button
                    key={scheme.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSettingsChange({ colorScheme: scheme.id })}
                    className={cn(
                      "h-8 px-2 text-xs",
                      settings.colorScheme === scheme.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    <div 
                      className="w-3 h-3 rounded-full border mr-1"
                      style={{ backgroundColor: scheme.color }}
                    />
                    {scheme.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Display</h4>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showIndicators}
                    onChange={(e) => onSettingsChange({ showIndicators: e.target.checked })}
                    className="rounded"
                  />
                  Technical Indicators
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showVolume}
                    onChange={(e) => onSettingsChange({ showVolume: e.target.checked })}
                    className="rounded"
                  />
                  Volume Profile
                </label>
              </div>
            </div>

            {/* Current Settings Info */}
            <div className="border-t pt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Style</span>
                <Badge variant="secondary" className="text-[10px]">
                  {chartStyles.find(s => s.id === settings.chartStyle)?.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Theme</span>
                <Badge variant="secondary" className="text-[10px]">
                  {colorSchemes.find(s => s.id === settings.colorScheme)?.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedChartControls;
