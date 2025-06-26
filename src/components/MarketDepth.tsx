
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface MarketDepthProps {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  currentPrice: number;
  className?: string;
}

const MarketDepth: React.FC<MarketDepthProps> = ({
  symbol,
  bids,
  asks,
  currentPrice,
  className
}) => {
  const maxTotal = Math.max(
    ...bids.map(b => b.total),
    ...asks.map(a => a.total)
  );

  const formatPrice = (price: number) => price.toFixed(2);
  const formatQuantity = (qty: number) => qty.toFixed(4);

  return (
    <Card className={cn("bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Market Depth</CardTitle>
          <Badge variant="outline" className="text-xs">
            {symbol}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Asks (Sell Orders) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <TrendingUp className="w-3 h-3 text-red-500" />
            <span>Asks (Sell)</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground mb-1">
            <span>Price</span>
            <span className="text-right">Quantity</span>
            <span className="text-right">Total</span>
          </div>
          
          {asks.slice(0, 8).reverse().map((ask, index) => (
            <div key={index} className="relative">
              <div 
                className="absolute inset-0 bg-red-500/10 rounded"
                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
              />
              <div className="relative grid grid-cols-3 gap-2 text-xs py-1 px-2">
                <span className="text-red-500 font-mono">${formatPrice(ask.price)}</span>
                <span className="text-right font-mono">{formatQuantity(ask.quantity)}</span>
                <span className="text-right font-mono text-muted-foreground">{formatQuantity(ask.total)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="flex items-center justify-center py-2 border-y bg-accent/30">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">${formatPrice(currentPrice)}</div>
            <div className="text-xs text-muted-foreground">Last Price</div>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <TrendingDown className="w-3 h-3 text-green-500" />
            <span>Bids (Buy)</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground mb-1">
            <span>Price</span>
            <span className="text-right">Quantity</span>
            <span className="text-right">Total</span>
          </div>
          
          {bids.slice(0, 8).map((bid, index) => (
            <div key={index} className="relative">
              <div 
                className="absolute inset-0 bg-green-500/10 rounded"
                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
              />
              <div className="relative grid grid-cols-3 gap-2 text-xs py-1 px-2">
                <span className="text-green-500 font-mono">${formatPrice(bid.price)}</span>
                <span className="text-right font-mono">{formatQuantity(bid.quantity)}</span>
                <span className="text-right font-mono text-muted-foreground">{formatQuantity(bid.total)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Market Stats */}
        <div className="border-t pt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Spread</span>
            <div className="font-mono text-primary">
              ${(asks[0]?.price - bids[0]?.price || 0).toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Spread %</span>
            <div className="font-mono text-primary">
              {(((asks[0]?.price - bids[0]?.price) / currentPrice * 100) || 0).toFixed(3)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDepth;
