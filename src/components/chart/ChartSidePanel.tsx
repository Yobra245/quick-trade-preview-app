
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import TradingInterface from '../TradingInterface';
import OrderBookWidget from '../OrderBookWidget';
import TechnicalIndicatorsPanel from '../TechnicalIndicatorsPanel';
import { ChartData } from '@/lib/types';

interface Pattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  signal: string;
  confidence: number;
}

interface ChartSidePanelProps {
  symbol: string;
  currentPrice: number;
  chartData: ChartData[];
  patterns: Pattern[];
  showIndicators: boolean;
  onPlaceOrder: (order: any) => void;
}

const ChartSidePanel: React.FC<ChartSidePanelProps> = ({
  symbol,
  currentPrice,
  chartData,
  patterns,
  showIndicators,
  onPlaceOrder
}) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Trading Interface */}
      <TradingInterface
        symbol={symbol}
        currentPrice={currentPrice}
        availableBalance={10000} // Mock balance
        onPlaceOrder={onPlaceOrder}
      />

      {/* Order Book Widget */}
      <OrderBookWidget
        symbol={symbol}
        currentPrice={currentPrice}
      />

      {/* Technical Indicators Panel */}
      {showIndicators && (
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
          {patterns.length > 0 ? (
            patterns.slice(0, 3).map((pattern) => (
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
    </div>
  );
};

export default ChartSidePanel;
