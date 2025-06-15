
import React from 'react';
import UserTrades from '@/components/UserTrades';

const Trades = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Trades</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your trading history and active positions.
        </p>
      </div>
      
      <UserTrades />
    </div>
  );
};

export default Trades;
