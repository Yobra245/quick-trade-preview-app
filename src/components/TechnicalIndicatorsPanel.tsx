
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';
import { ChartData } from '@/lib/types';

interface TechnicalIndicatorsPanelProps {
  data: ChartData[];
  currentPrice: number;
}

const TechnicalIndicatorsPanel: React.FC<TechnicalIndicatorsPanelProps> = ({
  data,
  currentPrice
}) => {
  const indicators = useTechnicalIndicators(data, 20);
  
  if (data.length < 20) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Insufficient data for indicators</p>
        </CardContent>
      </Card>
    );
  }

  const currentSMA = indicators.sma[indicators.sma.length - 1];
  const currentEMA = indicators.ema[indicators.ema.length - 1];
  const currentRSI = indicators.rsi[indicators.rsi.length - 1];
  const currentMACD = indicators.macd.macd[indicators.macd.macd.length - 1];
  const currentSignal = indicators.macd.signal[indicators.macd.signal.length - 1];

  const getSignal = (current: number, reference: number) => {
    if (current > reference * 1.01) return 'bullish';
    if (current < reference * 0.99) return 'bearish';
    return 'neutral';
  };

  const SignalIcon = ({ signal }: { signal: string }) => {
    switch (signal) {
      case 'bullish':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'bearish':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const smaSignal = getSignal(currentPrice, currentSMA);
  const emaSignal = getSignal(currentPrice, currentEMA);
  const macdSignal = getSignal(currentMACD, currentSignal);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Technical Indicators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Moving Averages */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">SMA(20)</span>
              <Badge variant="secondary" className={getSignalColor(smaSignal)}>
                <SignalIcon signal={smaSignal} />
              </Badge>
            </div>
            <div className="text-sm font-mono">${currentSMA?.toFixed(2) || '0.00'}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">EMA(20)</span>
              <Badge variant="secondary" className={getSignalColor(emaSignal)}>
                <SignalIcon signal={emaSignal} />
              </Badge>
            </div>
            <div className="text-sm font-mono">${currentEMA?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        {/* RSI */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">RSI(14)</span>
            <Badge variant="secondary" className={
              currentRSI > 70 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              currentRSI < 30 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              'bg-gray-500/10 text-gray-500 border-gray-500/20'
            }>
              {currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral'}
            </Badge>
          </div>
          <div className="text-sm font-mono">{currentRSI?.toFixed(2) || '0.00'}</div>
          <div className="w-full bg-secondary rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(currentRSI || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* MACD */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">MACD</span>
            <Badge variant="secondary" className={getSignalColor(macdSignal)}>
              <SignalIcon signal={macdSignal} />
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>MACD: {currentMACD?.toFixed(4) || '0.0000'}</div>
            <div>Signal: {currentSignal?.toFixed(4) || '0.0000'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalIndicatorsPanel;
