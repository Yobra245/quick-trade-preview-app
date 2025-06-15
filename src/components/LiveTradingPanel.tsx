
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingUp, TrendingDown, X, Clock } from 'lucide-react';
import { useLiveTrading } from '@/hooks/useLiveTrading';
import { toast } from '@/components/ui/use-toast';

const LiveTradingPanel = () => {
  const { orders, loading, createOrder, cancelOrder } = useLiveTrading();
  const [orderForm, setOrderForm] = useState({
    exchange: 'binance',
    symbol: 'BTCUSDT',
    side: 'BUY' as 'BUY' | 'SELL',
    order_type: 'MARKET' as 'MARKET' | 'LIMIT' | 'STOP_LOSS',
    quantity: '',
    price: '',
    stop_price: ''
  });

  const handleCreateOrder = async () => {
    try {
      if (!orderForm.quantity || parseFloat(orderForm.quantity) <= 0) {
        toast({
          title: "Invalid Quantity",
          description: "Please enter a valid quantity",
          variant: "destructive"
        });
        return;
      }

      if (orderForm.order_type === 'LIMIT' && (!orderForm.price || parseFloat(orderForm.price) <= 0)) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid limit price",
          variant: "destructive"
        });
        return;
      }

      const orderData = {
        exchange: orderForm.exchange,
        symbol: orderForm.symbol,
        side: orderForm.side,
        order_type: orderForm.order_type,
        quantity: parseFloat(orderForm.quantity),
        ...(orderForm.order_type === 'LIMIT' && { price: parseFloat(orderForm.price) }),
        ...(orderForm.order_type === 'STOP_LOSS' && { stop_price: parseFloat(orderForm.stop_price) })
      };

      await createOrder(orderData);
      
      // Reset form
      setOrderForm({
        exchange: 'binance',
        symbol: 'BTCUSDT',
        side: 'BUY',
        order_type: 'MARKET',
        quantity: '',
        price: '',
        stop_price: ''
      });

      toast({
        title: "Order Created",
        description: "Your order has been submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      FILLED: 'bg-green-100 text-green-800',
      PARTIALLY_FILLED: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      FAILED: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Create Order Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Create Live Order
          </CardTitle>
          <CardDescription>
            Execute trades directly on your connected exchanges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Exchange</Label>
              <Select
                value={orderForm.exchange}
                onValueChange={(value) => setOrderForm(prev => ({ ...prev, exchange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binance">Binance</SelectItem>
                  <SelectItem value="coinbase">Coinbase</SelectItem>
                  <SelectItem value="bybit">Bybit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Symbol</Label>
              <Select
                value={orderForm.symbol}
                onValueChange={(value) => setOrderForm(prev => ({ ...prev, symbol: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                  <SelectItem value="ADAUSDT">ADA/USDT</SelectItem>
                  <SelectItem value="SOLUSDT">SOL/USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Side</Label>
              <Select
                value={orderForm.side}
                onValueChange={(value: 'BUY' | 'SELL') => setOrderForm(prev => ({ ...prev, side: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      BUY
                    </div>
                  </SelectItem>
                  <SelectItem value="SELL">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      SELL
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select
                value={orderForm.order_type}
                onValueChange={(value: 'MARKET' | 'LIMIT' | 'STOP_LOSS') => setOrderForm(prev => ({ ...prev, order_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKET">Market</SelectItem>
                  <SelectItem value="LIMIT">Limit</SelectItem>
                  <SelectItem value="STOP_LOSS">Stop Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                step="0.00001"
                placeholder="0.001"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>

            {orderForm.order_type === 'LIMIT' && (
              <div className="space-y-2">
                <Label>Limit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="45000"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            )}

            {orderForm.order_type === 'STOP_LOSS' && (
              <div className="space-y-2">
                <Label>Stop Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="44000"
                  value={orderForm.stop_price}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, stop_price: e.target.value }))}
                />
              </div>
            )}
          </div>

          <Separator />

          <Button 
            onClick={handleCreateOrder} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </CardContent>
      </Card>

      {/* Live Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Orders ({orders.length})
          </CardTitle>
          <CardDescription>
            Track your active and recent orders in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders yet. Create your first order above.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {order.side === 'BUY' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{order.side}</span>
                    </div>
                    
                    <div>
                      <div className="font-medium">{order.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.exchange} • {order.order_type}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">{order.quantity}</div>
                      {order.price && (
                        <div className="text-sm text-muted-foreground">
                          @ ${order.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    
                    {(order.status === 'PENDING' || order.status === 'SUBMITTED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelOrder(order.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTradingPanel;
