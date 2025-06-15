
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PriceChart from './PriceChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MarketsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MarketsModal: React.FC<MarketsModalProps> = ({ open, onOpenChange }) => {
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  const exchanges = [
    { value: 'binance', label: 'Binance', description: 'Cryptocurrency Exchange' },
    { value: 'coinbase', label: 'Coinbase Pro', description: 'Cryptocurrency Exchange' },
    { value: 'forex', label: 'Forex Markets', description: 'Currency Pairs' },
    { value: 'stocks', label: 'Stock Markets', description: 'Equity Markets' }
  ];

  const symbols = {
    binance: [
      { value: 'BTC/USDT', label: 'Bitcoin (BTC/USDT)' },
      { value: 'ETH/USDT', label: 'Ethereum (ETH/USDT)' },
      { value: 'BNB/USDT', label: 'Binance Coin (BNB/USDT)' },
      { value: 'SOL/USDT', label: 'Solana (SOL/USDT)' },
      { value: 'XRP/USDT', label: 'Ripple (XRP/USDT)' },
      { value: 'ADA/USDT', label: 'Cardano (ADA/USDT)' }
    ],
    coinbase: [
      { value: 'BTC/USD', label: 'Bitcoin (BTC/USD)' },
      { value: 'ETH/USD', label: 'Ethereum (ETH/USD)' },
      { value: 'LTC/USD', label: 'Litecoin (LTC/USD)' },
      { value: 'BCH/USD', label: 'Bitcoin Cash (BCH/USD)' }
    ],
    forex: [
      { value: 'EUR/USD', label: 'Euro/US Dollar' },
      { value: 'GBP/USD', label: 'British Pound/US Dollar' },
      { value: 'USD/JPY', label: 'US Dollar/Japanese Yen' },
      { value: 'USD/CHF', label: 'US Dollar/Swiss Franc' },
      { value: 'AUD/USD', label: 'Australian Dollar/US Dollar' }
    ],
    stocks: [
      { value: 'AAPL', label: 'Apple Inc.' },
      { value: 'MSFT', label: 'Microsoft Corporation' },
      { value: 'GOOGL', label: 'Alphabet Inc.' },
      { value: 'AMZN', label: 'Amazon.com Inc.' },
      { value: 'TSLA', label: 'Tesla Inc.' }
    ]
  };

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' }
  ];

  const handleExchangeChange = (exchange: string) => {
    setSelectedExchange(exchange);
    // Reset symbol to first available for the new exchange
    const availableSymbols = symbols[exchange as keyof typeof symbols];
    if (availableSymbols && availableSymbols.length > 0) {
      setSelectedSymbol(availableSymbols[0].value);
    }
  };

  const currentSymbols = symbols[selectedExchange as keyof typeof symbols] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Live Market Charts</DialogTitle>
          <DialogDescription>
            View real-time charts from different exchanges and markets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exchange and Symbol Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Exchange/Market</label>
              <Select value={selectedExchange} onValueChange={handleExchangeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  {exchanges.map((exchange) => (
                    <SelectItem key={exchange.value} value={exchange.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{exchange.label}</span>
                        <span className="text-xs text-muted-foreground">{exchange.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Symbol</label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  {currentSymbols.map((symbol) => (
                    <SelectItem key={symbol.value} value={symbol.value}>
                      {symbol.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((timeframe) => (
                    <SelectItem key={timeframe.value} value={timeframe.value}>
                      {timeframe.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedSymbol} - {selectedExchange.toUpperCase()}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {timeframes.find(tf => tf.value === selectedTimeframe)?.label}
                </span>
              </CardTitle>
              <CardDescription>
                Live chart data from {exchanges.find(ex => ex.value === selectedExchange)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriceChart 
                symbol={selectedSymbol} 
                timeframe={selectedTimeframe as any}
                height={400}
              />
            </CardContent>
          </Card>

          {/* Market Info Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Market Info</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="news">Market News</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Market Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Exchange</p>
                      <p className="font-semibold">{exchanges.find(ex => ex.value === selectedExchange)?.label}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Symbol</p>
                      <p className="font-semibold">{selectedSymbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeframe</p>
                      <p className="font-semibold">{timeframes.find(tf => tf.value === selectedTimeframe)?.label}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold text-green-600">Live</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trading Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="font-bold">Loading...</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">24h Change</p>
                      <p className="font-bold">Loading...</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">24h High</p>
                      <p className="font-bold">Loading...</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">24h Low</p>
                      <p className="font-bold">Loading...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Market News</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Market news integration coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarketsModal;
