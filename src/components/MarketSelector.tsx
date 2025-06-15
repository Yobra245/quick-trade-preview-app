
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from '@/contexts/AppContext';
import { Building2, TrendingUp, DollarSign, Coins } from 'lucide-react';

const exchanges = [
  { id: 'binance', name: 'Binance', type: 'crypto', supported: ['crypto'] },
  { id: 'coinbase', name: 'Coinbase Pro', type: 'crypto', supported: ['crypto'] },
  { id: 'kraken', name: 'Kraken', type: 'crypto', supported: ['crypto'] },
  { id: 'bybit', name: 'Bybit', type: 'crypto', supported: ['crypto'] },
  { id: 'mt4', name: 'MetaTrader 4', type: 'forex', supported: ['forex', 'stocks'] },
  { id: 'mt5', name: 'MetaTrader 5', type: 'forex', supported: ['forex', 'stocks', 'crypto'] },
  { id: 'ib', name: 'Interactive Brokers', type: 'stocks', supported: ['stocks', 'forex'] },
  { id: 'alpaca', name: 'Alpaca', type: 'stocks', supported: ['stocks'] },
];

const marketTypes = [
  { id: 'crypto', name: 'Cryptocurrency', icon: Coins, color: 'bg-orange-500' },
  { id: 'forex', name: 'Forex', icon: DollarSign, color: 'bg-green-500' },
  { id: 'stocks', name: 'Stocks', icon: TrendingUp, color: 'bg-blue-500' },
];

const MarketSelector: React.FC = () => {
  const { selectedExchange, setSelectedExchange, selectedMarketType, setSelectedMarketType } = useAppContext();

  const availableExchanges = exchanges.filter(exchange => 
    exchange.supported.includes(selectedMarketType)
  );

  const handleMarketTypeChange = (marketType: string) => {
    setSelectedMarketType(marketType);
    // Reset exchange if current one doesn't support the new market type
    const currentExchange = exchanges.find(e => e.id === selectedExchange);
    if (!currentExchange?.supported.includes(marketType)) {
      const defaultExchange = availableExchanges[0];
      if (defaultExchange) {
        setSelectedExchange(defaultExchange.id);
      }
    }
  };

  const selectedMarket = marketTypes.find(m => m.id === selectedMarketType);
  const selectedExchangeData = exchanges.find(e => e.id === selectedExchange);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Market:</span>
        <Select value={selectedMarketType} onValueChange={handleMarketTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {marketTypes.map((market) => (
              <SelectItem key={market.id} value={market.id}>
                <div className="flex items-center gap-2">
                  <market.icon className="h-4 w-4" />
                  {market.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Exchange:</span>
        <Select value={selectedExchange} onValueChange={setSelectedExchange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableExchanges.map((exchange) => (
              <SelectItem key={exchange.id} value={exchange.id}>
                <div className="flex items-center gap-2">
                  {exchange.name}
                  {(exchange.id === 'mt4' || exchange.id === 'mt5') && (
                    <Badge variant="secondary" className="text-xs">MT</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMarket && (
        <Badge variant="outline" className={`${selectedMarket.color} text-white`}>
          <selectedMarket.icon className="h-3 w-3 mr-1" />
          {selectedMarket.name}
        </Badge>
      )}

      {selectedExchangeData && (selectedExchangeData.id === 'mt4' || selectedExchangeData.id === 'mt5') && (
        <Badge variant="secondary">
          MetaTrader Integration
        </Badge>
      )}
    </div>
  );
};

export default MarketSelector;
