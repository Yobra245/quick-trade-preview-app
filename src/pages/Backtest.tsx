
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Play, BarChart3, Settings } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useBacktest } from '@/hooks/useStrategy';
import { strategyService } from '@/lib/services/StrategyService';
import BacktestResultsDisplay from '@/components/BacktestResultsDisplay';

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

    if (startDate >= endDate) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after start date.",
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
    
    const dataStr = JSON.stringify({
      strategy: selectedStrategyConfig?.name,
      asset: selectedAsset,
      period: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString()
      },
      results: results
    }, null, 2);
    
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

      {/* Enhanced Results Display */}
      {results && (
        <BacktestResultsDisplay results={results} onExport={exportResults} />
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
