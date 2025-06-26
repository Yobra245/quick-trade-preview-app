
import React from 'react';
import TradingView from '@/components/TradingView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TradingChart = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Advanced Trading Charts</h1>
        <p className="text-muted-foreground mt-2">
          Professional-grade real-time charts with live price updates, just like Binance.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Trading Chart</CardTitle>
            <CardDescription>
              Real-time candlestick charts with WebSocket streaming from Binance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TradingView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradingChart;
