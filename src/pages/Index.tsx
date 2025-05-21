
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
  Info
} from "lucide-react";
import Navbar from '@/components/Navbar';
import SignalCard from '@/components/SignalCard';
import PriceChart from '@/components/PriceChart';
import PerformanceCard from '@/components/PerformanceCard';
import AIInsightCard from '@/components/AIInsightCard';
import RecentExecutions from '@/components/RecentExecutions';
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

const Index = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC/USDT');
  
  // Handler for clicking on a trade signal - show toast notification
  const handleSignalClick = (signalId: string) => {
    toast({
      title: "Signal Selected",
      description: `You've selected signal #${signalId}. View details or execute trade in the full version.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-10">
        <div className="flex flex-col gap-6 mt-4">
          {/* Top Cards */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Card className="bg-black/40 border border-gray-800 w-full sm:w-2/3">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Welcome to SignalAI</h2>
                    <p className="text-gray-400 mb-4">
                      AI-powered trading signals with automatic execution
                    </p>
                    <div className="flex gap-3">
                      <Button>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Signals
                      </Button>
                      <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure AI
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:block p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Auto-Trading</span>
                    </div>
                    <Badge className="mt-2 bg-yellow-500/20 text-yellow-400">Beta Feature</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border border-gray-800 w-full sm:w-1/3">
              <CardContent className="p-4">
                <h3 className="text-sm text-gray-400 mb-1">Market Summary</h3>
                <div className="space-y-3 mt-2">
                  {mockAssets.slice(0, 3).map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="font-medium">{asset.symbol}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono">{formatCurrency(asset.price)}</span>
                        <span className={asset.changePercentage24h >= 0 ? 'text-profit' : 'text-loss'}>
                          {formatPercentage(asset.changePercentage24h)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-3 text-xs text-gray-400">
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
              <PriceChart symbol={selectedAsset} />
              
              {/* Trade Signals Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Latest Trade Signals</h3>
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
                <h3 className="text-lg font-medium">AI Insights</h3>
                {mockInsights.map((insight) => (
                  <AIInsightCard key={insight.id} insight={insight} />
                ))}
              </div>
              
              {/* Quick Actions */}
              <Card className="bg-black/40 border border-gray-800">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
                      <ChartLine className="h-5 w-5 text-primary" />
                      <span className="text-xs">Backtest Strategy</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
                      <ChartBar className="h-5 w-5 text-primary" />
                      <span className="text-xs">Risk Settings</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="text-xs">Configuration</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
                      <Info className="h-5 w-5 text-primary" />
                      <span className="text-xs">Documentation</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
