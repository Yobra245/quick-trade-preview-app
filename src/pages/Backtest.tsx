import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Play, Download, BarChart3, Settings } from "lucide-react";
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
  Bar,
  Cell
} from 'recharts';
import { useBacktest } from '@/hooks/useStrategy';
import { strategyService } from '@/lib/services/StrategyService';

const Backtest = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [initialCapital, setInitialCapital] = useState('10000');
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [strategyParameters, setStrategyParameters] = useState<Record<string, any>>({});

  const { runBacktest, results, loading: isRunning, error } = useBacktest();

  // Get available strategies from service
  const strategies = strategyService.getAvailableStrategies();

  const assets = [
    { value: 'BTC/USDT', label: 'Bitcoin (BTC/USDT)' },
    { value: 'ETH/USDT', label: 'Ethereum (ETH/USDT)' },
    { value: 'ADA/USDT', label: 'Cardano (ADA/USDT)' },
    { value: 'SOL/USDT', label: 'Solana (SOL/USDT)' }
  ];

  const selectedStrategyConfig = strategies.find(s => s.id === selectedStrategy);

  const handleRunBacktest = async () => {
    if (!startDate || !endDate || !selectedStrategy || !selectedAsset) {
      toast({
        title: "Missing Parameters",
        description: "Please fill in all required fields to run the backtest.",
        variant: "destructive"
      });
      return;
    }

    try {
      await runBacktest(
        selectedStrategy,
        selectedAsset,
        strategyParameters,
        startDate,
        endDate,
        parseFloat(initialCapital)
      );
      
      toast({
        title: "Backtest Complete",
        description: `${selectedStrategyConfig?.name} strategy analysis completed successfully.`,
      });
    } catch (err) {
      toast({
        title: "Backtest Failed",
        description: error || "An error occurred during backtesting.",
        variant: "destructive"
      });
    }
  };

  const updateStrategyParameter = (paramName: string, value: any) => {
    setStrategyParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backtest-${selectedStrategy}-${selectedAsset}-${Date.now()}.json`;
    link.click();
    
    toast({
      title: "Export Complete",
      description: "Backtest results exported successfully.",
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="strategy">Trading Strategy</Label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{strategy.name}</span>
                        <span className="text-xs text-muted-foreground">{strategy.category}</span>
                      </div>
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
              <Button onClick={handleRunBacktest} disabled={isRunning} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? 'Running Analysis...' : 'Run Backtest'}
              </Button>
            </div>
          </div>

          {/* Strategy Parameters */}
          {selectedStrategyConfig && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {selectedStrategyConfig.name} Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedStrategyConfig.parameters).map(([key, param]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{param.name}</Label>
                      {param.type === 'number' && (
                        <Input
                          id={key}
                          type="number"
                          value={strategyParameters[key] || param.default}
                          onChange={(e) => updateStrategyParameter(key, parseFloat(e.target.value))}
                          min={param.min}
                          max={param.max}
                          step={param.step}
                        />
                      )}
                      {param.type === 'boolean' && (
                        <div className="flex items-center space-x-2">
                          <input
                            id={key}
                            type="checkbox"
                            checked={strategyParameters[key] || param.default}
                            onChange={(e) => updateStrategyParameter(key, e.target.checked)}
                          />
                          <Label htmlFor={key} className="text-sm">{param.description}</Label>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Results Panel */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.totalReturn.toFixed(2)}%</div>
                  <div className="text-sm text-gray-600">Total Return</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.sharpeRatio.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Sharpe Ratio</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{results.calmarRatio.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Calmar Ratio</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{results.sortinoRatio.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Sortino Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Trading Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Trading Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-semibold text-green-600">{results.winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trades</span>
                  <span className="font-semibold">{results.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Drawdown</span>
                  <span className="font-semibold text-red-600">{results.maxDrawdown.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volatility</span>
                  <span className="font-semibold">{results.volatility.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
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
                  <Bar dataKey="return">
                    {results.monthlyReturns.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.return >= 0 ? "#22c55e" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Backtest;
