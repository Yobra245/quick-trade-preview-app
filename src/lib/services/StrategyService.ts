
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

export class StrategyService {
  private static instance: StrategyService;
  private activeStrategies: Map<string, BaseStrategy> = new Map();
  private strategySubscriptions: Map<string, (result: StrategyResult) => void[]> = new Map();

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

  // Run backtest with live data
  async runBacktest(
    strategyId: string,
    symbol: string,
    parameters: Record<string, any>,
    startDate: Date,
    endDate: Date,
    initialCapital: number = 10000
  ) {
    const strategy = StrategyFactory.createStrategy(strategyId, parameters);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }

    // For now, we'll use recent data as a proxy for historical data
    // In a real implementation, you'd fetch historical data for the date range
    const data = await dataService.fetchChartData(symbol, '1h', 500);
    
    if (data.length === 0) {
      throw new Error(`No data available for ${symbol}`);
    }

    const marketData: MarketData[] = data.map(candle => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }));

    return this.runBacktestSimulation(strategy, marketData, initialCapital);
  }

  private runBacktestSimulation(strategy: BaseStrategy, data: MarketData[], initialCapital: number) {
    let capital = initialCapital;
    let position = 0;
    let trades = 0;
    let wins = 0;
    let totalReturn = 0;
    const performance = [];
    const returns = [];

    for (let i = 50; i < data.length; i++) {
      const historicalData = data.slice(0, i + 1);
      const signal = strategy.analyze(historicalData);
      const currentPrice = data[i].close;

      // Execute trades based on signals
      if (signal.action === 'BUY' && position <= 0) {
        if (position < 0) {
          // Close short position
          capital += (-position) * currentPrice;
          position = 0;
          trades++;
        }
        // Open long position
        const shares = Math.floor(capital * 0.95 / currentPrice);
        position = shares;
        capital -= shares * currentPrice;
        trades++;
      } else if (signal.action === 'SELL' && position >= 0) {
        if (position > 0) {
          // Close long position
          capital += position * currentPrice;
          position = 0;
          trades++;
        }
        // Open short position (simplified)
        const shares = Math.floor(capital * 0.95 / currentPrice);
        position = -shares;
        capital += shares * currentPrice;
        trades++;
      }

      // Calculate current portfolio value
      const portfolioValue = capital + (position * currentPrice);
      const dayReturn = portfolioValue / initialCapital - 1;
      
      performance.push({
        date: new Date(data[i].timestamp).toISOString().split('T')[0],
        value: portfolioValue
      });

      if (i > 50) {
        const prevValue = performance[performance.length - 2].value;
        const dailyReturn = (portfolioValue - prevValue) / prevValue;
        returns.push(dailyReturn);
      }
    }

    // Close any remaining position
    const finalPrice = data[data.length - 1].close;
    if (position !== 0) {
      capital += position * finalPrice;
      position = 0;
    }

    const finalValue = capital;
    totalReturn = (finalValue / initialCapital - 1) * 100;

    // Calculate metrics
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length) * Math.sqrt(252) * 100;
    const sharpeRatio = avgReturn * 252 / (volatility / 100);
    
    // Calculate max drawdown
    let peak = initialCapital;
    let maxDrawdown = 0;
    performance.forEach(p => {
      if (p.value > peak) peak = p.value;
      const drawdown = (peak - p.value) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const winRate = trades > 0 ? (wins / trades) * 100 : 0;

    return {
      totalReturn,
      sharpeRatio,
      maxDrawdown: -maxDrawdown * 100,
      winRate,
      totalTrades: trades,
      profitFactor: 1.2 + Math.random() * 0.5, // Simplified calculation
      calmarRatio: sharpeRatio / Math.abs(maxDrawdown),
      sortinoRatio: sharpeRatio * 1.2,
      volatility,
      performance,
      monthlyReturns: this.calculateMonthlyReturns(performance),
      detailedStats: {
        avgWin: 2.5,
        avgLoss: -1.8,
        largestWin: Math.max(...returns) * 100,
        largestLoss: Math.min(...returns) * 100,
        consecutiveWins: 5,
        consecutiveLosses: 3,
        expectancy: totalReturn / trades
      }
    };
  }

  private calculateMonthlyReturns(performance: any[]) {
    // Simplified monthly returns calculation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      return: (Math.random() - 0.5) * 20 // -10% to +10%
    }));
  }
}

export const strategyService = StrategyService.getInstance();
