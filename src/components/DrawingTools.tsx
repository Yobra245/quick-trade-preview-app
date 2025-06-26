
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, 
  Square, 
  Circle, 
  TrendingUp, 
  Minus, 
  Triangle,
  Ruler,
  Eraser,
  Undo,
  Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawingTool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface DrawingToolsProps {
  onToolSelect: (tool: string) => void;
  selectedTool: string;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const drawingTools: DrawingTool[] = [
  { id: 'cursor', name: 'Cursor', icon: Pencil, description: 'Select and move objects' },
  { id: 'line', name: 'Trend Line', icon: Minus, description: 'Draw trend lines' },
  { id: 'horizontal', name: 'Horizontal Line', icon: Minus, description: 'Draw horizontal support/resistance' },
  { id: 'vertical', name: 'Vertical Line', icon: Minus, description: 'Draw vertical time lines' },
  { id: 'rectangle', name: 'Rectangle', icon: Square, description: 'Draw rectangles' },
  { id: 'circle', name: 'Circle', icon: Circle, description: 'Draw circles' },
  { id: 'triangle', name: 'Triangle', icon: Triangle, description: 'Draw triangles' },
  { id: 'fibonacci', name: 'Fibonacci', icon: TrendingUp, description: 'Fibonacci retracement' },
  { id: 'ruler', name: 'Ruler', icon: Ruler, description: 'Measure price/time' }
];

const DrawingTools: React.FC<DrawingToolsProps> = ({
  onToolSelect,
  selectedTool,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="absolute top-4 right-4 z-20 w-64 bg-card/95 backdrop-blur-sm border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Drawing Tools</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-7 px-2"
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-7 px-2"
            >
              <Redo className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-red-500 hover:text-red-600"
            >
              <Eraser className="h-3 w-3" />
            </Button>
          </div>

          {/* Drawing tools grid */}
          <div className="grid grid-cols-3 gap-1">
            {drawingTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onToolSelect(tool.id)}
                  className={cn(
                    "h-8 w-full flex flex-col items-center justify-center p-1",
                    selectedTool === tool.id && "bg-primary text-primary-foreground"
                  )}
                  title={tool.description}
                >
                  <Icon className="h-3 w-3" />
                  <span className="text-[10px] mt-0.5">{tool.name.split(' ')[0]}</span>
                </Button>
              );
            })}
          </div>

          {/* Selected tool info */}
          {selectedTool !== 'cursor' && (
            <div className="text-xs text-muted-foreground bg-accent/50 p-2 rounded">
              <Badge variant="secondary" className="mb-1 text-[10px]">
                {drawingTools.find(t => t.id === selectedTool)?.name}
              </Badge>
              <p>{drawingTools.find(t => t.id === selectedTool)?.description}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DrawingTools;
