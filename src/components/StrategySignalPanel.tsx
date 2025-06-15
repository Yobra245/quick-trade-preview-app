
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStrategySignals } from '@/hooks/useStrategy';
import { useAppContext } from '@/contexts/AppContext';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

const StrategySignalPanel: React.FC = () => {
  const { selectedSymbol } = useAppContext();
  
  // Subscribe to multiple strategies
  const macdSignals = useStrategySignals('macd-crossover', selectedSymbol);
  const rsiSignals = useStrategySignals('rsi-oversold', selectedSymbol);
  const bollingerSignals = useStrategySignals('bollinger-bands', selectedSymbol);

  const allSignals = [
    { strategy: 'MACD', data: macdSignals },
    { strategy: 'RSI', data: rsiSignals },
    { strategy: 'Bollinger', data: bollingerSignals }
  ].filter(s => s.data.latestSignal);

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-500/20 text-green-400';
      case 'SELL': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSignalIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp className="h-4 w-4" />;
      case 'SELL': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (macdSignals.loading && rsiSignals.loading && bollingerSignals.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Loading Strategy Signals...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analyzing {selectedSymbol} with multiple strategies...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Strategy Signals - {selectedSymbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allSignals.length === 0 ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No active signals detected</p>
          </div>
        ) : (
          allSignals.map(({ strategy, data }) => (
            <div key={strategy} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{strategy} Strategy</span>
                  <Badge variant="outline" className={getSignalColor(data.latestSignal!.signal.action)}>
                    {getSignalIcon(data.latestSignal!.signal.action)}
                    {data.latestSignal!.signal.action}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Confidence: {data.latestSignal!.signal.confidence}%
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Entry Price</p>
                  <p className="font-medium">${data.latestSignal!.signal.entryPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stop Loss</p>
                  <p className="font-medium">${data.latestSignal!.signal.stopLoss.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Take Profit</p>
                  <p className="font-medium">${data.latestSignal!.signal.takeProfit.toFixed(2)}</p>
                </div>
              </div>

              {data.latestSignal!.signal.reasoning.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Analysis:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {data.latestSignal!.signal.reasoning.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default StrategySignalPanel;
