
import React from 'react';
import { useLivePrice, useLiveMarketData } from '@/hooks/useLiveData';
import { formatCurrency, formatPercentage } from '@/lib/mockData';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';

interface LivePriceDisplayProps {
  symbol: string;
  className?: string;
  showChange?: boolean;
  showVolume?: boolean;
}

const LivePriceDisplay: React.FC<LivePriceDisplayProps> = ({
  symbol,
  className = "",
  showChange = true,
  showVolume = false
}) => {
  const { selectedMarketType } = useAppContext();
  const { price, loading: priceLoading } = useLivePrice(symbol);
  const { marketData, loading: marketLoading } = useLiveMarketData(symbol);

  const formatPrice = (value: number) => {
    if (selectedMarketType === 'forex') {
      return value.toFixed(4);
    }
    return selectedMarketType === 'crypto' && value < 1 
      ? value.toFixed(6) 
      : formatCurrency(value);
  };

  if (priceLoading && marketLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const displayPrice = marketData?.price || price;
  const change24h = marketData?.change24h || 0;
  const changePercentage = marketData?.changePercentage24h || 0;
  const volume = marketData?.volume24h || 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Live Price Indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-mono text-lg font-semibold">
          {formatPrice(displayPrice)}
        </span>
      </div>

      {/* Price Change */}
      {showChange && marketData && (
        <div className={`flex items-center gap-1 ${
          changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {changePercentage >= 0 ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {formatPercentage(Math.abs(changePercentage))}
          </span>
          <span className="text-xs text-muted-foreground">
            ({change24h >= 0 ? '+' : ''}{formatPrice(Math.abs(change24h))})
          </span>
        </div>
      )}

      {/* Volume */}
      {showVolume && marketData && volume > 0 && (
        <Badge variant="secondary" className="text-xs">
          Vol: {volume > 1000000 ? `${(volume / 1000000).toFixed(1)}M` : `${(volume / 1000).toFixed(0)}K`}
        </Badge>
      )}
    </div>
  );
};

export default LivePriceDisplay;
