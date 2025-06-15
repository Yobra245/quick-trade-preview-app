import { BaseStrategy } from './StrategyEngine';
import { StrategySignal, MarketData, TechnicalIndicator } from './types';

export class MACDStrategy extends BaseStrategy {
  getName(): string {
    return 'MACD Crossover';
  }

  getDescription(): string {
    return 'Professional MACD crossover strategy with signal line confirmation and momentum filters';
  }

  getDefaultParameters(): Record<string, any> {
    return {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      minVolume: 1000000,
      confirmationPeriods: 2,
      rsiFilter: true,
      rsiOverbought: 70,
      rsiOversold: 30
    };
  }

  analyze(data: MarketData[]): StrategySignal {
    if (data.length < this.parameters.slowPeriod + this.parameters.signalPeriod + 10) {
      return this.createNeutralSignal(data[data.length - 1]);
    }

    const closes = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    const currentPrice = closes[closes.length - 1];
    const currentVolume = volumes[volumes.length - 1];

    // Calculate MACD
    const macdData = this.calculateMACD(closes);
    const rsi = this.calculateRSI(closes);

    if (macdData.macd.length < 3 || rsi.length < 3) {
      return this.createNeutralSignal(data[data.length - 1]);
    }

    const currentMACD = macdData.macd[macdData.macd.length - 1];
    const currentSignal = macdData.signal[macdData.signal.length - 1];
    const currentHistogram = macdData.histogram[macdData.histogram.length - 1];
    const previousHistogram = macdData.histogram[macdData.histogram.length - 2];
    const currentRSI = rsi[rsi.length - 1];

    const indicators: TechnicalIndicator[] = [
      {
        name: 'MACD',
        value: currentMACD,
        signal: currentMACD > currentSignal ? 'BUY' : 'SELL',
        strength: Math.min(Math.abs(currentMACD - currentSignal) * 100, 100)
      },
      {
        name: 'RSI',
        value: currentRSI,
        signal: currentRSI > 50 ? 'BUY' : 'SELL',
        strength: Math.abs(currentRSI - 50) * 2
      }
    ];

    // Volume filter
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const volumeConfirmed = currentVolume > this.parameters.minVolume && currentVolume > avgVolume * 1.2;

    // MACD crossover signals
    const bullishCrossover = currentHistogram > 0 && previousHistogram <= 0;
    const bearishCrossover = currentHistogram < 0 && previousHistogram >= 0;

    // RSI filter
    const rsiFilter = this.parameters.rsiFilter;
    const rsiBullish = !rsiFilter || (currentRSI > this.parameters.rsiOversold && currentRSI < this.parameters.rsiOverbought);
    const rsiBearish = !rsiFilter || (currentRSI < this.parameters.rsiOverbought && currentRSI > this.parameters.rsiOversold);

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let strength = 0;
    let confidence = 0;
    const reasoning: string[] = [];

    if (bullishCrossover && rsiBullish && volumeConfirmed) {
      action = 'BUY';
      strength = 80;
      confidence = Math.min(85 + (volumeConfirmed ? 10 : 0), 95);
      reasoning.push('MACD bullish crossover detected');
      reasoning.push('Volume confirmation present');
      if (rsiFilter) reasoning.push('RSI in favorable range');
    } else if (bearishCrossover && rsiBearish && volumeConfirmed) {
      action = 'SELL';
      strength = 80;
      confidence = Math.min(85 + (volumeConfirmed ? 10 : 0), 95);
      reasoning.push('MACD bearish crossover detected');
      reasoning.push('Volume confirmation present');
      if (rsiFilter) reasoning.push('RSI in favorable range');
    }

    // Calculate stop loss and take profit
    const atr = this.calculateATR(data.slice(-14));
    const stopLossDistance = atr * 2;
    const takeProfitDistance = atr * 3;

    return {
      action,
      strength,
      confidence,
      entryPrice: currentPrice,
      stopLoss: action === 'BUY' ? currentPrice - stopLossDistance : currentPrice + stopLossDistance,
      takeProfit: action === 'BUY' ? currentPrice + takeProfitDistance : currentPrice - takeProfitDistance,
      indicators,
      reasoning
    };
  }
}
