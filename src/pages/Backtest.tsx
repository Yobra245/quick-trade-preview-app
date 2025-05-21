import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import Navbar from '@/components/Navbar';
import {
  Play,
  Calendar,
  ArrowRight,
  Sliders,
  Download,
  LineChart as LineChartIcon,
  BarChart4
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const Backtest = () => {
  // Backtest parameters
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [timeframe, setTimeframe] = useState('1h');
  const [initialCapital, setInitialCapital] = useState('10000');
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  // Mock trading strategies
  const strategies = [
    { id: 'macd', name: 'MACD Crossover' },
    { id: 'rsi', name: 'RSI Oscillator' },
    { id: 'bb', name: 'Bollinger Bands' },
    { id: 'ai', name: 'AI Prediction Model' },
    { id: 'combined', name: 'Combined Strategy' }
  ];
  
  const [selectedStrategy, setSelectedStrategy] = useState('ai');
  
  // Mock backtest results data
  const mockBacktestResults = {
    summary: {
      totalTrades: 156,
      winningTrades: 98,
      losingTrades: 58,
      winRate: 62.8,
      profitFactor: 2.35,
      netProfit: 2876.42,
      netProfitPercentage: 28.76,
      maxDrawdown: 12.8,
      sharpeRatio: 1.8,
      averageProfit: 45.23,
      averageLoss: -24.16,
      averageTradeLength: '8.3 hours'
    },
    equity: Array.from({ length: 100 }, (_, i) => ({
      day: i + 1,
      equity: 10000 + (Math.random() * 500 - 100) * i / 10 + i * 30
    })),
    monthlyReturns: [
      { month: 'Jan', return: 3.2 },
      { month: 'Feb', return: -1.8 },
      { month: 'Mar', return: 5.1 },
      { month: 'Apr', return: 2.6 },
      { month: 'May', return: -2.3 },
      { month: 'Jun', return: 4.8 },
      { month: 'Jul', return: 6.2 },
      { month: 'Aug', return: 1.9 },
      { month: 'Sep', return: -3.5 },
      { month: 'Oct', return: 5.7 },
      { month: 'Nov', return: 4.3 },
      { month: 'Dec', return: 2.8 }
    ],
    drawdowns: [
      { id: 1, start: '2023-02-15', end: '2023-02-28', depth: 8.5, recovery: '13 days' },
      { id: 2, start: '2023-05-10', end: '2023-05-22', depth: 6.2, recovery: '12 days' },
      { id: 3, start: '2023-09-05', end: '2023-09-20', depth: 12.8, recovery: '15 days' }
    ],
    trades: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      date: `2023-${Math.floor(i / 3) + 1}-${(i % 30) + 1}`,
      type: Math.random() > 0.4 ? 'BUY' : 'SELL',
      entryPrice: 20000 + Math.random() * 10000,
      exitPrice: 20000 + Math.random() * 10000,
      pnl: Math.random() > 0.35 ? Math.random() * 500 : -Math.random() * 300,
      pnlPercentage: Math.random() > 0.35 ? Math.random() * 5 : -Math.random() * 3,
    }))
  };

  const runBacktest = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setHasResults(true);
      
      toast({
        title: "Backtest Completed",
        description: "Your backtest has been completed successfully.",
      });
    }, 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Helper function to determine bar color based on return value
  const getBarColor = (value: number) => {
    return value >= 0 ? "#22c55e" : "#ef4444";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Strategy Backtesting</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Backtest Parameters</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Trading Pair</Label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger id="symbol">
                      <SelectValue placeholder="Select trading pair" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                      <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                      <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
                      <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                      <SelectItem value="XRP/USDT">XRP/USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="startDate" 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="endDate" 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger id="timeframe">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initialCapital">Initial Capital (USDT)</Label>
                  <Input 
                    id="initialCapital" 
                    type="number" 
                    value={initialCapital} 
                    onChange={(e) => setInitialCapital(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strategy">Trading Strategy</Label>
                  <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                    <SelectTrigger id="strategy">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map(strategy => (
                        <SelectItem key={strategy.id} value={strategy.id}>{strategy.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={runBacktest} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                      Running Backtest...
                    </div>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Backtest
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            {hasResults && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Performance Summary</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Net Profit</p>
                      <p className={`text-lg font-semibold ${mockBacktestResults.summary.netProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(mockBacktestResults.summary.netProfit)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">ROI</p>
                      <p className={`text-lg font-semibold ${mockBacktestResults.summary.netProfitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercentage(mockBacktestResults.summary.netProfitPercentage)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-lg font-semibold">{mockBacktestResults.summary.winRate}%</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Profit Factor</p>
                      <p className="text-lg font-semibold">{mockBacktestResults.summary.profitFactor}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Max Drawdown</p>
                      <p className="text-lg font-semibold text-loss">-{mockBacktestResults.summary.maxDrawdown}%</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Sharpe Ratio</p>
                      <p className="text-lg font-semibold">{mockBacktestResults.summary.sharpeRatio}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-400">Total Trades: {mockBacktestResults.summary.totalTrades}</p>
                    <div className="w-full h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-profit rounded-full" 
                        style={{ width: `${mockBacktestResults.summary.winRate}%` }}
                      ></div>
                    </div>
                    <div className="flex text-xs mt-1 justify-between">
                      <span className="text-profit">{mockBacktestResults.summary.winningTrades} Wins</span>
                      <span className="text-loss">{mockBacktestResults.summary.losingTrades} Losses</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    Export Results
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Results Panel */}
          <div className="lg:col-span-2">
            {!hasResults ? (
              <div className="flex items-center justify-center h-96 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="text-center p-8">
                  <LineChartIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">Backtest Results</h3>
                  <p className="text-gray-500 max-w-md">
                    Configure your backtest parameters and click 'Run Backtest' to see your strategy's performance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Equity Curve</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockBacktestResults.equity}>
                          <defs>
                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            axisLine={{ stroke: '#1f2937' }}
                            tickLine={{ stroke: '#1f2937' }}
                            label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                          />
                          <YAxis 
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            axisLine={{ stroke: '#1f2937' }}
                            tickLine={{ stroke: '#1f2937' }}
                            domain={['dataMin - 500', 'dataMax + 500']}
                            label={{ value: 'Equity (USDT)', angle: -90, position: 'insideLeft', offset: 10, fill: '#9ca3af' }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), 'Equity']}
                            labelFormatter={(value) => `Day ${value}`}
                            contentStyle={{ 
                              backgroundColor: '#111827', 
                              borderColor: '#374151',
                              borderRadius: '0.375rem'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="equity" 
                            stroke="#3b82f6" 
                            fillOpacity={1}
                            fill="url(#colorEquity)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Tabs defaultValue="monthly">
                  <TabsList className="w-full">
                    <TabsTrigger value="monthly" className="flex-1">
                      <BarChart4 className="mr-2 h-4 w-4" />
                      Monthly Returns
                    </TabsTrigger>
                    <TabsTrigger value="drawdowns" className="flex-1">
                      <Sliders className="mr-2 h-4 w-4" />
                      Drawdowns
                    </TabsTrigger>
                    <TabsTrigger value="trades" className="flex-1">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Recent Trades
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="monthly">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockBacktestResults.monthlyReturns}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                              <XAxis 
                                dataKey="month" 
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                axisLine={{ stroke: '#1f2937' }}
                                tickLine={{ stroke: '#1f2937' }}
                              />
                              <YAxis 
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                axisLine={{ stroke: '#1f2937' }}
                                tickLine={{ stroke: '#1f2937' }}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <Tooltip
                                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']}
                                contentStyle={{ 
                                  backgroundColor: '#111827', 
                                  borderColor: '#374151',
                                  borderRadius: '0.375rem'
                                }}
                              />
                              <Bar 
                                dataKey="return" 
                                fill="#3b82f6"
                                className="fill-current"
                              >
                                {mockBacktestResults.monthlyReturns.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.return >= 0 ? "#22c55e" : "#ef4444"} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="drawdowns">
                    <Card>
                      <CardContent className="py-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-800">
                            <thead className="bg-gray-900/50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  #
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Start Date
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  End Date
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Depth
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Recovery
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                              {mockBacktestResults.drawdowns.map((drawdown) => (
                                <tr key={drawdown.id} className="hover:bg-gray-900/30">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {drawdown.id}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {drawdown.start}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {drawdown.end}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-loss">
                                    -{drawdown.depth}%
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {drawdown.recovery}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="trades">
                    <Card>
                      <CardContent className="py-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-800">
                            <thead className="bg-gray-900/50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  #
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Date
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Type
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Entry
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Exit
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  P/L
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                              {mockBacktestResults.trades.map((trade) => (
                                <tr key={trade.id} className="hover:bg-gray-900/30">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {trade.id}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {trade.date}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${trade.type === 'BUY' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'}`}>
                                      {trade.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {formatCurrency(trade.entryPrice)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {formatCurrency(trade.exitPrice)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <div className={trade.pnl >= 0 ? 'text-profit' : 'text-loss'}>
                                      {formatCurrency(trade.pnl)}
                                      <span className="block text-xs opacity-80">
                                        {formatPercentage(trade.pnlPercentage)}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtest;
