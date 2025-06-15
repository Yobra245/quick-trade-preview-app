
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
import LivePriceDisplay from '@/components/LivePriceDisplay';
import ConnectionStatus from '@/components/ConnectionStatus';
import StrategySignalPanel from '@/components/StrategySignalPanel';
import { 
  mockSignals, 
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

  // Get market-specific symbols based on selected market type
  const getMarketSymbols = () => {
    switch (selectedMarketType) {
      case 'forex':
        return ['EUR/USD', 'GBP/USD', 'USD/JPY'];
      case 'stocks':
        return ['AAPL', 'MSFT', 'GOOGL'];
      default:
        return ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'];
    }
  };

  const marketSymbols = getMarketSymbols();

  return (
    <div className="space-y-6">
      {/* Market Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <h2 className="text-lg font-semibold">Market Selection</h2>
          <p className="text-sm text-muted-foreground">Choose your trading market and exchange</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          <MarketSelector />
        </div>
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
              {selectedMarketType.charAt(0).toUpperCase() + selectedMarketType.slice(1)} Market - Live Prices
            </h3>
            <div className="space-y-3">
              {marketSymbols.map((symbol) => (
                <div key={symbol} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-medium">{symbol}</span>
                  </div>
                  <LivePriceDisplay 
                    symbol={symbol} 
                    showChange={true}
                    className="text-right"
                  />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm text-muted-foreground">
              View All Markets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Price Display for Selected Symbol */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedSymbol}</h3>
              <p className="text-sm text-muted-foreground">Live Market Data</p>
            </div>
            <LivePriceDisplay 
              symbol={selectedSymbol} 
              showChange={true}
              showVolume={true}
              className="text-right"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <PriceChart symbol={selectedSymbol} />
          
          {/* Live Strategy Signals */}
          <StrategySignalPanel />
          
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
