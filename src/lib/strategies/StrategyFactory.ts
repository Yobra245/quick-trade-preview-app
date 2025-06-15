import { BaseStrategy } from './StrategyEngine';
import { MACDStrategy } from './MACDStrategy';
import { RSIStrategy } from './RSIStrategy';
import { BollingerStrategy } from './BollingerStrategy';
import { StrategyConfig } from './types';

type StrategyConstructor = new (config: StrategyConfig, parameters?: Record<string, any>) => BaseStrategy;

export class StrategyFactory {
  private static strategies: Map<string, StrategyConstructor> = new Map();

  static {
    // Initialize strategies in static block
    this.strategies.set('macd-crossover', MACDStrategy);
    this.strategies.set('rsi-oversold', RSIStrategy);
    this.strategies.set('bollinger-bands', BollingerStrategy);
  }

  static createStrategy(strategyId: string, parameters?: Record<string, any>): BaseStrategy | null {
    const StrategyClass = this.strategies.get(strategyId);
    if (!StrategyClass) {
      console.error(`Strategy ${strategyId} not found`);
      return null;
    }

    const config = this.getStrategyConfig(strategyId);
    return new StrategyClass(config, parameters);
  }

  static getAvailableStrategies(): StrategyConfig[] {
    return Array.from(this.strategies.keys()).map(id => this.getStrategyConfig(id));
  }

  static getStrategyConfig(strategyId: string): StrategyConfig {
    const configs: Record<string, StrategyConfig> = {
      'macd-crossover': {
        id: 'macd-crossover',
        name: 'MACD Crossover',
        description: 'Professional MACD crossover strategy with signal line confirmation',
        parameters: {
          fastPeriod: { name: 'Fast EMA Period', type: 'number', default: 12, min: 5, max: 20, step: 1, description: 'Fast EMA period for MACD calculation' },
          slowPeriod: { name: 'Slow EMA Period', type: 'number', default: 26, min: 15, max: 40, step: 1, description: 'Slow EMA period for MACD calculation' },
          signalPeriod: { name: 'Signal Line Period', type: 'number', default: 9, min: 5, max: 15, step: 1, description: 'Signal line EMA period' },
          rsiFilter: { name: 'RSI Filter', type: 'boolean', default: true, description: 'Enable RSI momentum filter' }
        },
        timeframes: ['1h', '4h', '1d'],
        assets: ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT'],
        riskLevel: 'MEDIUM',
        category: 'MOMENTUM'
      },
      'rsi-oversold': {
        id: 'rsi-oversold',
        name: 'RSI Oversold/Overbought',
        description: 'Mean reversion strategy using RSI with divergence detection',
        parameters: {
          rsiPeriod: { name: 'RSI Period', type: 'number', default: 14, min: 10, max: 21, step: 1, description: 'RSI calculation period' },
          oversoldLevel: { name: 'Oversold Level', type: 'number', default: 30, min: 20, max: 40, step: 5, description: 'RSI oversold threshold' },
          overboughtLevel: { name: 'Overbought Level', type: 'number', default: 70, min: 60, max: 80, step: 5, description: 'RSI overbought threshold' },
          divergenceDetection: { name: 'Divergence Detection', type: 'boolean', default: true, description: 'Enable price-RSI divergence detection' }
        },
        timeframes: ['1h', '4h', '1d'],
        assets: ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT'],
        riskLevel: 'LOW',
        category: 'MEAN_REVERSION'
      },
      'bollinger-bands': {
        id: 'bollinger-bands',
        name: 'Bollinger Bands',
        description: 'Volatility-based strategy with squeeze detection and breakouts',
        parameters: {
          period: { name: 'Period', type: 'number', default: 20, min: 15, max: 30, step: 1, description: 'Moving average period for bands' },
          standardDeviations: { name: 'Standard Deviations', type: 'number', default: 2, min: 1.5, max: 2.5, step: 0.1, description: 'Number of standard deviations for bands' },
          squeezeThreshold: { name: 'Squeeze Threshold', type: 'number', default: 0.1, min: 0.05, max: 0.2, step: 0.01, description: 'Bandwidth threshold for squeeze detection' }
        },
        timeframes: ['1h', '4h', '1d'],
        assets: ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT'],
        riskLevel: 'MEDIUM',
        category: 'VOLATILITY'
      }
    };

    return configs[strategyId] || configs['macd-crossover'];
  }

  static registerStrategy(id: string, strategyClass: StrategyConstructor, config: StrategyConfig): void {
    this.strategies.set(id, strategyClass);
  }
}
