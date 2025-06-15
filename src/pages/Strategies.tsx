
import React from 'react';
import StrategySignalPanel from '@/components/StrategySignalPanel';

const Strategies = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Strategies</h1>
        <p className="text-muted-foreground mt-2">
          Configure and monitor your trading strategies and signals.
        </p>
      </div>
      
      <StrategySignalPanel />
    </div>
  );
};

export default Strategies;
