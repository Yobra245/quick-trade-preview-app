
import React from 'react';
import { cn } from '@/lib/utils';

interface LivePriceOverlayProps {
  price: number;
  previousPrice: number;
  symbol: string;
  isConnected: boolean;
}

const LivePriceOverlay: React.FC<LivePriceOverlayProps> = ({
  price,
  previousPrice,
  symbol,
  isConnected
}) => {
  const priceChange = price - previousPrice;
  const isUp = priceChange >= 0;
  
  return (
    <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">{symbol}</h4>
        <div className={cn(
          "w-2 h-2 rounded-full",
          isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
        )} />
      </div>
      
      <div className="space-y-1">
        <div className={cn(
          "text-2xl font-mono font-bold",
          isUp ? "text-green-500" : "text-red-500"
        )}>
          ${price.toFixed(2)}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            "font-medium",
            isUp ? "text-green-500" : "text-red-500"
          )}>
            {isUp ? "+" : ""}{priceChange.toFixed(2)}
          </span>
          <span className={cn(
            "font-medium",
            isUp ? "text-green-500" : "text-red-500"
          )}>
            ({((priceChange / previousPrice) * 100).toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default LivePriceOverlay;
