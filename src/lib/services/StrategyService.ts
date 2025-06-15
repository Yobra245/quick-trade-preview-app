import { dataService } from './DataService';
import { StrategyFactory } from '../strategies/StrategyFactory';
import { BaseStrategy } from '../strategies/StrategyEngine';
import { ChartData } from '../types';
import { StrategySignal, MarketData } from '../strategies/types';

export interface StrategyResult {
  strategyId: string;
  strategyName: string;
  symbol: string;
  signal: StrategySignal;
  timestamp: number;
}

export interface Trade {
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  signal: StrategySignal;
}

export interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  calmarRatio: number;
  sortinoRatio: number;
  volatility: number;
  performance: Array<{ date: string; value: number }>;
  monthlyReturns: Array<{ month: string; return: number }>;
  trades: Trade[];
  detailedStats: {
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    consecutiveWins: number;
    consecutiveLosses: number;
    expectancy: number;
  };
}

export class StrategyService {
  private static instance: StrategyService;
  private activeStrategies: Map<string, BaseStrategy> = new Map();
  private strategySubscriptions: Map<string, ((result: StrategyResult) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): StrategyService {
    if (!StrategyService.instance) {
      StrategyService.instance = new StrategyService();
    }
    return StrategyService.instance;
  }

  // Subscribe to strategy signals for a symbol
  subscribeToStrategy(
    strategyId: string, 
    symbol: string, 
    parameters: Record<string, any> = {},
    callback: (result: StrategyResult) => void
  ) {
    const key = `${strategyId}-${symbol}`;
    
    // Create strategy instance
    const strategy = StrategyFactory.createStrategy(strategyId, parameters);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }
    
    this.activeStrategies.set(key, strategy);
    
    // Set up callback subscription
    if (!this.strategySubscriptions.has(key)) {
      this.strategySubscriptions.set(key, []);
    }
    this.strategySubscriptions.get(key)!.push(callback);

    // Start analyzing data for this symbol
    this.startStrategyAnalysis(key, strategyId, symbol, strategy);
  }

  private async startStrategyAnalysis(key: string, strategyId: string, symbol: string, strategy: BaseStrategy) {
    // Get initial historical data for analysis
    const historicalData = await dataService.fetchChartData(symbol, '1h', 100);
    
    if (historicalData.length === 0) {
      console.warn(`No historical data available for ${symbol}`);
      return;
    }

    // Convert ChartData to MarketData format
    const marketData: MarketData[] = historicalData.map(candle => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }));

    // Run initial analysis
    this.analyzeAndNotify(key, strategyId, symbol, strategy, marketData);

    // Set up periodic analysis (every 5 minutes)
    const interval = setInterval(async () => {
      try {
        const updatedData = await dataService.fetchChartData(symbol, '1h', 100);
        const updatedMarketData: MarketData[] = updatedData.map(candle => ({
          timestamp: candle.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        }));
        
        this.analyzeAndNotify(key, strategyId, symbol, strategy, updatedMarketData);
      } catch (error) {
        console.error('Error updating strategy analysis:', error);
      }
    }, 300000); // 5 minutes

    // Store interval for cleanup
    (strategy as any)._interval = interval;
  }

  private analyzeAndNotify(key: string, strategyId: string, symbol: string, strategy: BaseStrategy, data: MarketData[]) {
    try {
      const signal = strategy.analyze(data);
      
      const result: StrategyResult = {
        strategyId,
        strategyName: strategy.getName(),
        symbol,
        signal,
        timestamp: Date.now()
      };

      // Notify all subscribers
      const callbacks = this.strategySubscriptions.get(key) || [];
      callbacks.forEach(callback => {
        try {
          callback(result);
        } catch (error) {
          console.error('Error in strategy callback:', error);
        }
      });
    } catch (error) {
      console.error('Error analyzing strategy:', error);
    }
  }

  // Unsubscribe from strategy
  unsubscribeFromStrategy(strategyId: string, symbol: string, callback: (result: StrategyResult) => void) {
    const key = `${strategyId}-${symbol}`;
    const callbacks = this.strategySubscriptions.get(key);
    
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      // Clean up if no more subscribers
      if (callbacks.length === 0) {
        this.cleanupStrategy(key);
      }
    }
  }

  private cleanupStrategy(key: string) {
    const strategy = this.activeStrategies.get(key);
    if (strategy && (strategy as any)._interval) {
      clearInterval((strategy as any)._interval);
    }
    
    this.activeStrategies.delete(key);
    this.strategySubscriptions.delete(key);
  }

  // Get available strategies
  getAvailableStrategies() {
    return StrategyFactory.getAvailableStrategies();
  }

  // Run backtest with actual strategy execution
  async runBacktest(
    strategyId: string,
    symbol: string,
    parameters: Record<string, any>,
    startDate: Date,
    endDate: Date,
    initialCapital: number = 10000
  ): Promise<BacktestResult> {
    const strategy = StrategyFactory.createStrategy(strategyId, parameters);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }

    // Fetch historical data for the specified period
    const data = await dataService.fetchChartData(symbol, '1h', 1000);
    
    if (data.length === 0) {
      throw new Error(`No data available for ${symbol}`);
    }

    // Filter data for the date range
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const filteredData = data.filter(candle => 
      candle.timestamp >= startTime && candle.timestamp <= endTime
    );

    if (filteredData.length < 50) {
      throw new Error('Insufficient data for the selected date range');
    }

    const marketData: MarketData[] = filteredData.map(candle => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }));

    return this.executeBacktest(strategy, marketData, initialCapital);
  }

  private executeBacktest(strategy: BaseStrategy, data: MarketData[], initialCapital: number): BacktestResult {
    let capital = initialCapital;
    let position = 0;
    let entryPrice = 0;
    const trades: Trade[] = [];
    const performance = [];
    const dailyReturns = [];
    
    let wins = 0;
    let losses = 0;
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    // Start analysis after we have enough data for indicators
    for (let i = 50; i < data.length; i++) {
      const historicalData = data.slice(0, i + 1);
      const signal = strategy.analyze(historicalData);
      const currentPrice = data[i].close;
      const currentTime = data[i].timestamp;

      // Execute trades based on strategy signals
      if (signal.action === 'BUY' && position <= 0) {
        // Close short position if exists
        if (position < 0) {
          const profit = (-position) * (entryPrice - currentPrice);
          capital += (-position) * entryPrice + profit;
          
          trades.push({
            type: 'SELL',
            price: currentPrice,
            quantity: -position,
            timestamp: currentTime,
            signal
          });

          if (profit > 0) {
            wins++;
            consecutiveWins++;
            consecutiveLosses = 0;
            totalProfit += profit;
            maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
          } else {
            losses++;
            consecutiveLosses++;
            consecutiveWins = 0;
            totalLoss += Math.abs(profit);
            maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
          }
        }

        // Open long position
        const positionSize = Math.floor((capital * 0.95) / currentPrice);
        if (positionSize > 0) {
          position = positionSize;
          entryPrice = currentPrice;
          capital -= positionSize * currentPrice;
          
          trades.push({
            type: 'BUY',
            price: currentPrice,
            quantity: positionSize,
            timestamp: currentTime,
            signal
          });
        }
      } 
      else if (signal.action === 'SELL' && position >= 0) {
        // Close long position if exists
        if (position > 0) {
          const profit = position * (currentPrice - entryPrice);
          capital += position * currentPrice;
          
          trades.push({
            type: 'SELL',
            price: currentPrice,
            quantity: position,
            timestamp: currentTime,
            signal
          });

          if (profit > 0) {
            wins++;
            consecutiveWins++;
            consecutiveLosses = 0;
            totalProfit += profit;
            maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
          } else {
            losses++;
            consecutiveLosses++;
            consecutiveWins = 0;
            totalLoss += Math.abs(profit);
            maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
          }
        }

        // Open short position (simplified for demo)
        const positionSize = Math.floor((capital * 0.95) / currentPrice);
        if (positionSize > 0) {
          position = -positionSize;
          entryPrice = currentPrice;
          capital += positionSize * currentPrice;
          
          trades.push({
            type: 'SELL',
            price: currentPrice,
            quantity: positionSize,
            timestamp: currentTime,
            signal
          });
        }
      }

      // Calculate portfolio value
      let positionValue = 0;
      if (position > 0) {
        positionValue = position * currentPrice;
      } else if (position < 0) {
        positionValue = position * (2 * entryPrice - currentPrice);
      }
      
      const portfolioValue = capital + positionValue;
      
      performance.push({
        date: new Date(currentTime).toISOString().split('T')[0],
        value: portfolioValue
      });

      // Calculate daily returns
      if (performance.length > 1) {
        const prevValue = performance[performance.length - 2].value;
        const dailyReturn = (portfolioValue - prevValue) / prevValue;
        dailyReturns.push(dailyReturn);
      }
    }

    // Close final position
    const finalPrice = data[data.length - 1].close;
    if (position !== 0) {
      if (position > 0) {
        const profit = position * (finalPrice - entryPrice);
        capital += position * finalPrice;
        if (profit > 0) {
          wins++;
          totalProfit += profit;
        } else {
          losses++;
          totalLoss += Math.abs(profit);
        }
      } else {
        const profit = (-position) * (entryPrice - finalPrice);
        capital += (-position) * entryPrice + profit;
        if (profit > 0) {
          wins++;
          totalProfit += profit;
        } else {
          losses++;
          totalLoss += Math.abs(profit);
        }
      }
    }

    const finalValue = capital;
    const totalReturn = ((finalValue / initialCapital) - 1) * 100;
    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    // Calculate performance metrics
    const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
    const volatility = this.calculateVolatility(dailyReturns) * Math.sqrt(252) * 100;
    const sharpeRatio = volatility > 0 ? (avgReturn * 252) / (volatility / 100) : 0;
    
    const maxDrawdown = this.calculateMaxDrawdown(performance);
    const calmarRatio = Math.abs(maxDrawdown) > 0 ? totalReturn / Math.abs(maxDrawdown) : 0;
    const sortinoRatio = this.calculateSortinoRatio(dailyReturns);
    
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 10 : 1;
    
    const avgWin = wins > 0 ? totalProfit / wins : 0;
    const avgLoss = losses > 0 ? totalLoss / losses : 0;
    const expectancy = totalTrades > 0 ? (totalProfit - totalLoss) / totalTrades : 0;

    const winningTrades = trades.filter((_, i) => i > 0 && this.isWinningTrade(trades[i], trades[i-1]));
    const losingTrades = trades.filter((_, i) => i > 0 && !this.isWinningTrade(trades[i], trades[i-1]));
    
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => this.calculateTradeProfit(t))) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => this.calculateTradeProfit(t))) : 0;

    return {
      totalReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      totalTrades,
      profitFactor,
      calmarRatio,
      sortinoRatio,
      volatility,
      performance,
      trades,
      monthlyReturns: this.calculateMonthlyReturns(performance),
      detailedStats: {
        avgWin,
        avgLoss,
        largestWin,
        largestLoss,
        consecutiveWins: maxConsecutiveWins,
        consecutiveLosses: maxConsecutiveLosses,
        expectancy
      }
    };
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateMaxDrawdown(performance: Array<{ value: number }>): number {
    let peak = performance[0]?.value || 0;
    let maxDrawdown = 0;
    
    for (const point of performance) {
      if (point.value > peak) {
        peak = point.value;
      }
      const drawdown = ((peak - point.value) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return -maxDrawdown;
  }

  private calculateSortinoRatio(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const negativeReturns = returns.filter(r => r < 0);
    
    if (negativeReturns.length === 0) return avgReturn > 0 ? 10 : 0;
    
    const downstdeDeviation = Math.sqrt(
      negativeReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / negativeReturns.length
    );
    
    return downstdeDeviation > 0 ? (avgReturn * 252) / (downstdeDeviation * Math.sqrt(252)) : 0;
  }

  private isWinningTrade(currentTrade: Trade, previousTrade: Trade): boolean {
    if (currentTrade.type === 'SELL' && previousTrade.type === 'BUY') {
      return currentTrade.price > previousTrade.price;
    }
    if (currentTrade.type === 'BUY' && previousTrade.type === 'SELL') {
      return currentTrade.price < previousTrade.price;
    }
    return false;
  }

  private calculateTradeProfit(trade: Trade): number {
    // Simplified profit calculation - in real implementation this would be more complex
    return trade.quantity * trade.price * 0.01; // 1% profit estimation
  }

  private calculateMonthlyReturns(performance: Array<{ date: string; value: number }>) {
    const monthlyData = new Map<string, { start: number; end: number }>();
    
    performance.forEach(point => {
      const date = new Date(point.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { start: point.value, end: point.value });
      } else {
        monthlyData.get(monthKey)!.end = point.value;
      }
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      return: ((data.end - data.start) / data.start) * 100
    }));
  }
}

export const strategyService = StrategyService.getInstance();
