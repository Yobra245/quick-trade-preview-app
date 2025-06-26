
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, DollarSign, Percent, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradingInterfaceProps {
  symbol: string;
  currentPrice: number;
  availableBalance: number;
  onPlaceOrder: (order: any) => void;
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({
  symbol,
  currentPrice,
  availableBalance,
  onPlaceOrder
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState('');

  const totalValue = parseFloat(quantity || '0') * parseFloat(price || '0');
  const maxQuantityBuy = availableBalance / currentPrice;
  const maxQuantitySell = 1.5; // Mock available balance for selling

  const handlePlaceOrder = () => {
    const order = {
      symbol,
      side,
      type: orderType,
      quantity: parseFloat(quantity),
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
      timestamp: Date.now()
    };
    
    onPlaceOrder(order);
    
    // Reset form
    setQuantity('');
    if (orderType === 'market') {
      setPrice(currentPrice.toString());
    }
  };

  const isFormValid = quantity && parseFloat(quantity) > 0 && 
    (orderType === 'market' || (price && parseFloat(price) > 0)) &&
    (orderType !== 'stop' || (stopPrice && parseFloat(stopPrice) > 0));

  return (
    <Card className="bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Place Order</CardTitle>
          <Badge variant="outline" className="text-xs">
            {symbol}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Buy/Sell Toggle */}
        <Tabs value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="text-green-500 data-[state=active]:bg-green-500/20">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-red-500 data-[state=active]:bg-red-500/20">
              <DollarSign className="w-3 h-3 mr-1" />
              Sell
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {/* Order Type */}
            <div className="space-y-2">
              <Label className="text-xs">Order Type</Label>
              <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Quantity</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-xs"
                  onClick={() => setQuantity((side === 'buy' ? maxQuantityBuy : maxQuantitySell).toFixed(4))}
                >
                  Max
                </Button>
              </div>
              <Input
                type="number"
                placeholder="0.0000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-8 font-mono"
              />
              <div className="text-xs text-muted-foreground">
                Max: {(side === 'buy' ? maxQuantityBuy : maxQuantitySell).toFixed(4)} {symbol.split('/')[0]}
              </div>
            </div>

            {/* Price (for limit and stop orders) */}
            {orderType !== 'market' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Price</Label>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-xs"
                      onClick={() => setPrice((currentPrice * 0.99).toFixed(2))}
                    >
                      -1%
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-xs"
                      onClick={() => setPrice((currentPrice * 1.01).toFixed(2))}
                    >
                      +1%
                    </Button>
                  </div>
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-8 font-mono"
                />
              </div>
            )}

            {/* Stop Price (for stop orders) */}
            {orderType === 'stop' && (
              <div className="space-y-2">
                <Label className="text-xs">Stop Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  className="h-8 font-mono"
                />
              </div>
            )}

            {/* Order Summary */}
            <div className="space-y-2 p-3 bg-accent/30 rounded-lg">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono">${totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available</span>
                <span className="font-mono">${availableBalance.toFixed(2)}</span>
              </div>
              {orderType !== 'market' && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Est. Fee</span>
                  <span className="font-mono">${(totalValue * 0.001).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <Button
              className={cn(
                "w-full h-10",
                side === 'buy' 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
              disabled={!isFormValid}
              onClick={handlePlaceOrder}
            >
              {side === 'buy' ? 'Buy' : 'Sell'} {symbol.split('/')[0]}
            </Button>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-1">
              {['25%', '50%', '75%', '100%'].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const maxQty = side === 'buy' ? maxQuantityBuy : maxQuantitySell;
                    const percentage = parseInt(percent) / 100;
                    setQuantity((maxQty * percentage).toFixed(4));
                  }}
                >
                  {percent}
                </Button>
              ))}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradingInterface;
