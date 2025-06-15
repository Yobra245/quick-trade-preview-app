
import React from 'react';
import LiveTradingPanel from '@/components/LiveTradingPanel';
import MarketSelector from '@/components/MarketSelector';

const LiveTrading = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Live Trading</h1>
        <p className="text-muted-foreground mt-2">
          Monitor markets and execute trades in real-time.
        </p>
      </div>
      <div className="mb-6">
        <MarketSelector />
      </div>
      <LiveTradingPanel />
    </div>
  );
};

export default LiveTrading;
