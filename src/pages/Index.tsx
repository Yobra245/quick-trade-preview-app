
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CircleDollarSign, 
  Settings, 
  ChartLine, 
  TrendingUp, 
  ChartBar,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import SignalCard from '@/components/SignalCard';
import PriceChart from '@/components/PriceChart';
import PerformanceCard from '@/components/PerformanceCard';
import AIInsightCard from '@/components/AIInsightCard';
import RecentExecutions from '@/components/RecentExecutions';
import MarketSelector from '@/components/MarketSelector';
import { 
  mockSignals, 
  mockAssets, 
  mockPerformance, 
  mockInsights, 
  mockExecutions,
  formatCurrency,
  formatPercentage
} from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';

const Index = () => {
  const { selectedSymbol, selectedMarketType, selectedExchange } = useAppContext();
  
  // Handler for clicking on a trade signal - show toast notification
  const handleSignalClick = (signalId: string) => {
    toast({
      title: "Signal Selected",
      description: `You've selected signal #${signalId}. View details or execute trade in the full version.`,
    });
  };

  // Get market-specific data based on selected market type
  const getMarketData = () => {
    switch (selectedMarketType) {
      case 'forex':
        return {
          assets: [
            { id: '1', symbol: 'EUR/USD', price: 1.0923, changePercentage24h: 0.12 },
            { id: '2', symbol: 'GBP/USD', price: 1.2634, changePercentage24h: -0.08 },
            { id: '3', symbol: 'USD/JPY', price: 149.87, changePercentage24h: 0.15 },
          ]
        };
      case 'stocks':
        return {
          assets: [
            { id: '1', symbol: 'AAPL', price: 189.95, changePercentage24h: 1.24 },
            { id: '2', symbol: 'MSFT', price: 378.85, changePercentage24h: 0.67 },
            { id: '3', symbol: 'GOOGL', price: 142.56, changePercentage24h: -0.34 },
          ]
        };
      default:
        return { assets: mockAssets };
    }
  };

  const marketData = getMarketData();

  return (
    <div className="space-y-6">
      {/* Market Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <h2 className="text-lg font-semibold">Market Selection</h2>
          <p className="text-sm text-muted-foreground">Choose your trading market and exchange</p>
        </div>
        <MarketSelector />
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 w-full sm:w-2/3">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome to SignalAI</h1>
                <p className="text-muted-foreground mb-6">
                  AI-powered trading signals with automatic execution across {selectedMarketType}, forex, and stocks
                </p>
                <div className="flex gap-3">
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Signals
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure AI
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:block p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Multi-Market Trading</span>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                  {selectedExchange.toUpperCase()} Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full sm:w-1/3">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground mb-4">
              {selectedMarketType.charAt(0).toUpperCase() + selectedMarketType.slice(1)} Market Summary
            </h3>
            <div className="space-y-3">
              {marketData.assets.slice(0, 3).map((asset) => (
                <div key={asset.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-medium">{asset.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">
                      {selectedMarketType === 'forex' ? asset.price.toFixed(4) : formatCurrency(asset.price)}
                    </span>
                    <div className={`flex items-center gap-1 ${asset.changePercentage24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.changePercentage24h >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span className="text-sm">{formatPercentage(Math.abs(asset.changePercentage24h))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm text-muted-foreground">
              View All Markets
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <PriceChart symbol={selectedSymbol} />
          
          {/* Trade Signals Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Latest Trade Signals - {selectedSymbol}</h3>
              <Link to="/signals" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSignals.slice(0, 4).map((signal) => (
                <SignalCard 
                  key={signal.id} 
                  signal={signal} 
                  onClick={() => handleSignalClick(signal.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Recent Executions */}
          <RecentExecutions executions={mockExecutions} />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance Card */}
          <PerformanceCard data={mockPerformance} />
          
          {/* AI Insights */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">AI Insights</h3>
            {mockInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
          
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" asChild>
                  <Link to="/backtest">
                    <ChartLine className="h-5 w-5 text-primary" />
                    <span className="text-sm">Backtest Strategy</span>
                  </Link>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" asChild>
                  <Link to="/settings">
                    <ChartBar className="h-5 w-5 text-primary" />
                    <span className="text-sm">Risk Settings</span>
                  </Link>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" asChild>
                  <Link to="/settings">
                    <Settings className="h-5 w-5 text-primary" />
                    <span className="text-sm">Configuration</span>
                  </Link>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <Info className="h-5 w-5 text-primary" />
                  <span className="text-sm">Documentation</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
