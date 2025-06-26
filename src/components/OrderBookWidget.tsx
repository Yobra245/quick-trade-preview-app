
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Activity, BarChart3 } from 'lucide-react';
import MarketDepth from './MarketDepth';

interface OrderBookWidgetProps {
  symbol: string;
  currentPrice: number;
}

// Mock data - replace with real data from your WebSocket service
const generateMockOrderBook = (currentPrice: number) => {
  const bids = [];
  const asks = [];
  let totalBid = 0;
  let totalAsk = 0;

  // Generate bids (buy orders) below current price
  for (let i = 0; i < 15; i++) {
    const price = currentPrice - (i + 1) * (Math.random() * 5 + 1);
    const quantity = Math.random() * 10 + 0.1;
    totalBid += quantity;
    bids.push({ price, quantity, total: totalBid });
  }

  // Generate asks (sell orders) above current price
  for (let i = 0; i < 15; i++) {
    const price = currentPrice + (i + 1) * (Math.random() * 5 + 1);
    const quantity = Math.random() * 10 + 0.1;
    totalAsk += quantity;
    asks.push({ price, quantity, total: totalAsk });
  }

  return { bids, asks };
};

const OrderBookWidget: React.FC<OrderBookWidgetProps> = ({
  symbol,
  currentPrice
}) => {
  const [selectedView, setSelectedView] = useState<'depth' | 'trades' | 'chart'>('depth');
  const { bids, asks } = generateMockOrderBook(currentPrice);

  return (
    <div className="space-y-4">
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="depth" className="text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            Order Book
          </TabsTrigger>
          <TabsTrigger value="trades" className="text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Recent Trades
          </TabsTrigger>
          <TabsTrigger value="chart" className="text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />
            Depth Chart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="depth" className="mt-4">
          <MarketDepth
            symbol={symbol}
            bids={bids}
            asks={asks}
            currentPrice={currentPrice}
          />
        </TabsContent>

        <TabsContent value="trades" className="mt-4">
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                  <span>Price</span>
                  <span className="text-right">Quantity</span>
                  <span className="text-right">Time</span>
                </div>
                
                {Array.from({ length: 12 }, (_, i) => {
                  const isGreen = Math.random() > 0.5;
                  const price = currentPrice + (Math.random() - 0.5) * 20;
                  const quantity = Math.random() * 5 + 0.1;
                  const time = new Date(Date.now() - i * 1000 * 30).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });
                  
                  return (
                    <div key={i} className="grid grid-cols-3 gap-2 text-xs py-1">
                      <span className={`font-mono ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
                        ${price.toFixed(2)}
                      </span>
                      <span className="text-right font-mono">{quantity.toFixed(4)}</span>
                      <span className="text-right text-muted-foreground">{time}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Market Depth Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Depth Chart Visualization</p>
                  <p className="text-xs">Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderBookWidget;
