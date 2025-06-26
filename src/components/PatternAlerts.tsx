
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Pattern } from '@/hooks/usePatternRecognition';
import { cn } from '@/lib/utils';

interface PatternAlertsProps {
  patterns: Pattern[];
  onDismiss: (patternId: string) => void;
}

const PatternAlerts: React.FC<PatternAlertsProps> = ({ patterns, onDismiss }) => {
  const [dismissedPatterns, setDismissedPatterns] = useState<Set<string>>(new Set());
  const [newPatterns, setNewPatterns] = useState<Set<string>>(new Set());

  // Track new patterns for animation
  useEffect(() => {
    const currentPatternIds = new Set(patterns.map(p => p.id));
    const newIds = new Set<string>();
    
    patterns.forEach(pattern => {
      if (!dismissedPatterns.has(pattern.id)) {
        newIds.add(pattern.id);
      }
    });
    
    setNewPatterns(newIds);
    
    // Remove new pattern status after animation
    const timer = setTimeout(() => {
      setNewPatterns(new Set());
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [patterns, dismissedPatterns]);

  const activePatterns = patterns.filter(p => !dismissedPatterns.has(p.id));

  const handleDismiss = (patternId: string) => {
    setDismissedPatterns(prev => new Set(prev).add(patternId));
    onDismiss(patternId);
  };

  const getPatternIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSignalColor = (signal: Pattern['signal']) => {
    switch (signal) {
      case 'buy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sell':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  if (activePatterns.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 space-y-2 max-w-sm">
      {activePatterns.slice(0, 3).map((pattern) => (
        <Card
          key={pattern.id}
          className={cn(
            "bg-card/95 backdrop-blur-sm border-2 transition-all duration-300",
            newPatterns.has(pattern.id) && "animate-pulse border-primary",
            pattern.type === 'bullish' && "border-green-500/30",
            pattern.type === 'bearish' && "border-red-500/30",
            pattern.type === 'neutral' && "border-yellow-500/30"
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPatternIcon(pattern.type)}
                <CardTitle className="text-sm">{pattern.name}</CardTitle>
                <Badge variant="secondary" className={getSignalColor(pattern.signal)}>
                  {pattern.signal.toUpperCase()}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(pattern.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">{pattern.description}</p>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-secondary rounded-full h-1">
                  <div 
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      pattern.confidence > 0.7 ? "bg-green-500" :
                      pattern.confidence > 0.5 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${pattern.confidence * 100}%` }}
                  />
                </div>
                <span className="font-mono">
                  {(pattern.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {activePatterns.length > 3 && (
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span>+{activePatterns.length - 3} more patterns</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatternAlerts;
