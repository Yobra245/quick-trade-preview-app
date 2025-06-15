
import React from 'react';
import UserPortfolio from '@/components/UserPortfolio';

const Portfolio = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground mt-2">
          Track your trading portfolio and performance metrics.
        </p>
      </div>
      
      <UserPortfolio />
    </div>
  );
};

export default Portfolio;
