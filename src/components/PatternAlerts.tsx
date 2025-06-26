
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Pattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  signal: string;
  confidence: number;
}

interface PatternAlertsProps {
  patterns: Pattern[];
  onDismiss: (patternId: string) => void;
}

const PatternAlerts: React.FC<PatternAlertsProps> = ({ patterns, onDismiss }) => {
  if (patterns.length === 0) return null;

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'bullish':
        return 'border-green-500/20 bg-green-500/5';
      case 'bearish':
        return 'border-red-500/20 bg-red-500/5';
      default:
        return 'border-yellow-500/20 bg-yellow-500/5';
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 max-w-sm space-y-2">
      {patterns.slice(0, 3).map((pattern) => (
        <Card 
          key={pattern.id} 
          className={cn(
            "border shadow-lg backdrop-blur-sm",
            getPatternColor(pattern.type)
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPatternIcon(pattern.type)}
                <CardTitle className="text-sm">{pattern.name}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(pattern.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  pattern.type === 'bullish' && "bg-green-500/10 text-green-500",
                  pattern.type === 'bearish' && "bg-red-500/10 text-red-500"
                )}
              >
                {pattern.signal}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {(pattern.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatternAlerts;
