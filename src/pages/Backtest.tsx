
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Play, Download, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const Backtest = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [initialCapital, setInitialCapital] = useState('10000');
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Mock backtest data
  const mockResults = {
    totalReturn: 23.45,
    sharpeRatio: 1.23,
    maxDrawdown: -8.2,
    winRate: 67.5,
    totalTrades: 156,
    profitFactor: 1.48,
    performance: [
      { date: '2024-01', value: 10000 },
      { date: '2024-02', value: 10500 },
      { date: '2024-03', value: 11200 },
      { date: '2024-04', value: 10800 },
      { date: '2024-05', value: 12100 },
      { date: '2024-06', value: 12345 }
    ],
    monthlyReturns: [
      { month: 'Jan', return: 5.0 },
      { month: 'Feb', return: 6.7 },
      { month: 'Mar', return: -3.6 },
      { month: 'Apr', return: 12.0 },
      { month: 'May', return: 2.0 }
    ]
  };

  const strategies = [
    { value: 'macd-crossover', label: 'MACD Crossover' },
    { value: 'rsi-oversold', label: 'RSI Oversold/Overbought' },
    { value: 'bollinger-bands', label: 'Bollinger Bands' },
    { value: 'moving-average', label: 'Moving Average Crossover' },
    { value: 'ai-ensemble', label: 'AI Ensemble Strategy' }
  ];

  const assets = [
    { value: 'BTC/USDT', label: 'Bitcoin (BTC/USDT)' },
    { value: 'ETH/USDT', label: 'Ethereum (ETH/USDT)' },
    { value: 'ADA/USDT', label: 'Cardano (ADA/USDT)' },
    { value: 'SOL/USDT', label: 'Solana (SOL/USDT)' }
  ];

  const runBacktest = async () => {
    if (!startDate || !endDate || !selectedStrategy || !selectedAsset) {
      toast({
        title: "Missing Parameters",
        description: "Please fill in all required fields to run the backtest.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setIsRunning(false);
      toast({
        title: "Backtest Complete",
        description: "Your backtest has been successfully completed.",
      });
    }, 3000);
  };

  const exportResults = () => {
    toast({
      title: "Export Started",
      description: "Results are being exported to CSV format.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Strategy Backtesting</h1>
        <div className="flex gap-2">
          {results && (
            <Button variant="outline" onClick={exportResults}>
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Backtest Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="strategy">Trading Strategy</Label>
            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((strategy) => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset">Trading Pair</Label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.value} value={asset.value}>
                    {asset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capital">Initial Capital (USDT)</Label>
            <Input
              id="capital"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              placeholder="10000"
            />
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end">
            <Button onClick={runBacktest} disabled={isRunning} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              {isRunning ? 'Running...' : 'Run Backtest'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Panel */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.totalReturn}%</div>
                  <div className="text-sm text-gray-600">Total Return</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.sharpeRatio}</div>
                  <div className="text-sm text-gray-600">Sharpe Ratio</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{results.maxDrawdown}%</div>
                  <div className="text-sm text-gray-600">Max Drawdown</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{results.winRate}%</div>
                  <div className="text-sm text-gray-600">Win Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Trading Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trades</span>
                  <span className="font-semibold">{results.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Factor</span>
                  <span className="font-semibold">{results.profitFactor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Initial Capital</span>
                  <span className="font-semibold">${initialCapital}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Value</span>
                  <span className="font-semibold text-green-600">
                    ${(parseFloat(initialCapital) * (1 + results.totalReturn / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Portfolio Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={results.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Returns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={results.monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="return" 
                    fill={(dataPoint: any) => dataPoint.return >= 0 ? "#22c55e" : "#ef4444"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Backtest;
