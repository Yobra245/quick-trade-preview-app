
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
import { Building2, TrendingUp, DollarSign, Coins, SwitchCamera, Boxes, Banknote } from 'lucide-react';

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

const typeMap: Record<string, { label: string, color: string, icon?: React.ReactNode }> = {
  crypto: { label: "Crypto", color: "bg-orange-100 text-orange-800", icon: <Coins className="h-3 w-3" /> },
  stocks: { label: "Stocks", color: "bg-blue-100 text-blue-800", icon: <TrendingUp className="h-3 w-3" /> },
  forex:  { label: "Forex", color: "bg-green-100 text-green-800", icon: <DollarSign className="h-3 w-3" /> },
};

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
  const isMetaTrader = selectedExchange === 'mt4' || selectedExchange === 'mt5';

  return (
    <div className="w-full flex flex-wrap gap-8 py-4 items-start">
      {/* Step 1: Market Type Selector */}
      <div className="flex flex-col gap-2 min-w-[13rem]">
        <span className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
          Step 1: Select Market Type
        </span>
        <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-1">
          <Coins className="h-3 w-3 opacity-70" />
          Market Type
        </label>
        <Select value={selectedMarketType} onValueChange={handleMarketTypeChange}>
          <SelectTrigger className="w-48 border-2 border-primary/20 focus-within:border-primary transition-colors">
            <SelectValue placeholder="Select Market Type" />
            <SwitchCamera className="h-4 w-4 ml-2 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent className="z-50">
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
        {selectedMarket && (
          <Badge variant="outline" className={`${selectedMarket.color} text-white mt-2`}>
            <selectedMarket.icon className="h-3 w-3 mr-1" />
            {selectedMarket.name}
          </Badge>
        )}
      </div>

      {/* Step 2: Exchange Selector */}
      <div className="flex flex-col gap-2 min-w-[16rem]">
        <span className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
          Step 2: Select Exchange
        </span>
        <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-1">
          <Building2 className="h-3 w-3 opacity-70" />
          Exchange
        </label>
        <div className={`rounded-lg border-2 transition-colors ${isMetaTrader ? 'border-yellow-400 shadow-yellow-200/40 shadow' : 'border-primary/20'} bg-background`}>
          <Select value={selectedExchange} onValueChange={setSelectedExchange}>
            <SelectTrigger className="w-56 focus-within:border-primary transition-colors">
              <SelectValue placeholder="Select Exchange" />
              <SwitchCamera className="h-4 w-4 ml-2 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              {availableExchanges.map((exchange) => (
                <SelectItem 
                  key={exchange.id} 
                  value={exchange.id}
                  className={`rounded px-2 transition-all cursor-pointer flex items-center 
                    ${
                      selectedExchange === exchange.id
                        ? (exchange.id === 'mt4' || exchange.id === 'mt5'
                          ? 'bg-yellow-100 border-l-4 border-yellow-500 font-semibold text-yellow-900 shadow-md'
                          : 'bg-primary/10 border-l-4 border-primary font-bold text-primary')
                        : ''
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    {(exchange.id === 'mt4' || exchange.id === 'mt5')
                      ? <Banknote className="h-4 w-4 text-yellow-700" />
                      : (
                        exchange.type === 'crypto'
                          ? <Coins className="h-4 w-4 text-orange-500" />
                          : exchange.type === 'stocks'
                          ? <TrendingUp className="h-4 w-4 text-blue-600" />
                          : <DollarSign className="h-4 w-4 text-green-600" />
                      )
                    }
                    <span>{exchange.name}</span>
                    {typeMap[exchange.type] && (
                      <Badge className={`${typeMap[exchange.type].color} ml-1`} variant="secondary">
                        {typeMap[exchange.type].icon}
                        <span className="ml-1">{typeMap[exchange.type].label}</span>
                      </Badge>
                    )}
                    {(exchange.id === 'mt4' || exchange.id === 'mt5') && (
                      <Badge 
                        variant={selectedExchange === exchange.id ? "default" : "secondary"} 
                        className={selectedExchange === exchange.id ? "ml-1 bg-yellow-500 text-white" : "ml-1"}
                      >
                        MT
                      </Badge>
                    )}
                  </div>
                  {exchange.id === 'mt4' || exchange.id === 'mt5' ? (
                    <span className="ml-2 italic text-[0.85em] text-yellow-600">MetaTrader</span>
                  ) : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedExchangeData && (selectedExchangeData.id === 'mt4' || selectedExchangeData.id === 'mt5') && (
          <Badge variant="default" className="mt-2 bg-yellow-500 text-yellow-50 shadow">
            MetaTrader Integration Active
          </Badge>
        )}
        <span className="mt-2 text-xs text-muted-foreground">Switching exchange will update your live connection and trading panel.</span>
      </div>
    </div>
  );
};

export default MarketSelector;

