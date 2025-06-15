
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { BacktestResult } from '@/lib/services/StrategyService';

interface BacktestResultsDisplayProps {
  results: BacktestResult;
  onExport: () => void;
}

const BacktestResultsDisplay: React.FC<BacktestResultsDisplayProps> = ({ results, onExport }) => {
  const winLossData = [
    { name: 'Wins', value: Math.round((results.winRate / 100) * results.totalTrades), fill: '#22c55e' },
    { name: 'Losses', value: Math.round(((100 - results.winRate) / 100) * results.totalTrades), fill: '#ef4444' }
  ];

  const riskMetrics = [
    { metric: 'Sharpe Ratio', value: results.sharpeRatio, benchmark: 1.0 },
    { metric: 'Sortino Ratio', value: results.sortinoRatio, benchmark: 1.5 },
    { metric: 'Calmar Ratio', value: results.calmarRatio, benchmark: 0.5 },
    { metric: 'Max Drawdown', value: Math.abs(results.maxDrawdown), benchmark: 10 }
  ];

  const getMetricColor = (value: number, benchmark: number, isLower: boolean = false) => {
    const isGood = isLower ? value < benchmark : value > benchmark;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Backtest Results</h2>
          <p className="text-muted-foreground">Comprehensive analysis of strategy performance</p>
        </div>
        <Button onClick={onExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-1 ${results.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {results.totalReturn >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {results.totalReturn.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(results.winRate, 50)}`}>
              {results.winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((results.winRate / 100) * results.totalTrades)} wins / {results.totalTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(results.profitFactor, 1.2)}`}>
              {results.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross profit / Gross loss
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(Math.abs(results.maxDrawdown), 10, true)}`}>
              {results.maxDrawdown.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Largest peak-to-trough decline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance Over Time</CardTitle>
          <CardDescription>Cumulative returns throughout the backtest period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={results.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Portfolio Value']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Metrics and Win/Loss Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk-Adjusted Returns</CardTitle>
            <CardDescription>Key risk metrics compared to benchmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskMetrics.map((item) => (
                <div key={item.metric} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getMetricColor(item.value, item.benchmark, item.metric === 'Max Drawdown')}`}>
                      {item.value.toFixed(2)}
                    </span>
                    <Badge variant={getMetricColor(item.value, item.benchmark, item.metric === 'Max Drawdown').includes('green') ? 'default' : 'destructive'}>
                      {item.benchmark > item.value && item.metric !== 'Max Drawdown' ? 'Below' : item.value > item.benchmark && item.metric === 'Max Drawdown' ? 'High' : 'Good'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
            <CardDescription>Visual breakdown of winning vs losing trades</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Returns</CardTitle>
          <CardDescription>Month-by-month performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={results.monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']} />
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

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Trading Statistics</CardTitle>
          <CardDescription>Comprehensive breakdown of trading performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Trade Statistics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Trades:</span>
                  <span className="font-medium">{results.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Win:</span>
                  <span className="font-medium text-green-600">${results.detailedStats.avgWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Loss:</span>
                  <span className="font-medium text-red-600">${results.detailedStats.avgLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expectancy:</span>
                  <span className={`font-medium ${results.detailedStats.expectancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${results.detailedStats.expectancy.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Best/Worst Trades</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Largest Win:</span>
                  <span className="font-medium text-green-600">${results.detailedStats.largestWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Largest Loss:</span>
                  <span className="font-medium text-red-600">${results.detailedStats.largestLoss.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Consecutive Trades</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Max Wins:</span>
                  <span className="font-medium text-green-600">{results.detailedStats.consecutiveWins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Losses:</span>
                  <span className="font-medium text-red-600">{results.detailedStats.consecutiveLosses}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Risk Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Volatility:</span>
                  <span className="font-medium">{results.volatility.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sharpe Ratio:</span>
                  <span className={`font-medium ${getMetricColor(results.sharpeRatio, 1.0)}`}>
                    {results.sharpeRatio.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacktestResultsDisplay;
