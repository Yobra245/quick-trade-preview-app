import { BaseStrategy } from './StrategyEngine';
import { StrategySignal, MarketData, TechnicalIndicator } from './types';

export class RSIStrategy extends BaseStrategy {
  getName(): string {
    return 'RSI Oversold/Overbought';
  }

  getDescription(): string {
    return 'Professional RSI mean reversion strategy with multi-timeframe confirmation and divergence detection';
  }

  getDefaultParameters(): Record<string, any> {
    return {
      rsiPeriod: 14,
      oversoldLevel: 30,
      overboughtLevel: 70,
      extremeOversold: 20,
      extremeOverbought: 80,
      volumeConfirmation: true,
      divergenceDetection: true,
      trendFilter: true,
      smaFilterPeriod: 50
    };
  }

  analyze(data: MarketData[]): StrategySignal {
    if (data.length < Math.max(this.parameters.rsiPeriod, this.parameters.smaFilterPeriod) + 20) {
      return this.createNeutralSignal(data[data.length - 1]);
    }

    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);
    const currentPrice = closes[closes.length - 1];

    // Calculate indicators
    const rsi = this.calculateRSI(closes, this.parameters.rsiPeriod);
    const sma = this.calculateSMA(closes, this.parameters.smaFilterPeriod);
    
    if (rsi.length < 10) {
      return this.createNeutralSignal(data[data.length - 1]);
    }

    const currentRSI = rsi[rsi.length - 1];
    const previousRSI = rsi[rsi.length - 2];
    const currentSMA = sma[sma.length - 1];

    // Volume analysis
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volumes[volumes.length - 1];
    const volumeSpike = currentVolume > avgVolume * 1.5;

    // Trend filter
    const trendBullish = !this.parameters.trendFilter || currentPrice > currentSMA;
    const trendBearish = !this.parameters.trendFilter || currentPrice < currentSMA;

    // Divergence detection
    const divergence = this.detectDivergence(closes, highs, lows, rsi);

    const indicators: TechnicalIndicator[] = [
      {
        name: 'RSI',
        value: currentRSI,
        signal: currentRSI > 50 ? 'BUY' : 'SELL',
        strength: Math.abs(currentRSI - 50) * 2
      },
      {
        name: 'Trend',
        value: currentPrice - currentSMA,
        signal: trendBullish ? 'BUY' : 'SELL',
        strength: Math.abs((currentPrice - currentSMA) / currentSMA) * 100
      }
    ];

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let strength = 0;
    let confidence = 0;
    const reasoning: string[] = [];

    // Oversold conditions (Buy signals)
    if (currentRSI <= this.parameters.oversoldLevel && trendBullish) {
      action = 'BUY';
      strength = Math.max(60, 100 - currentRSI * 2);
      confidence = 70;
      reasoning.push(`RSI oversold at ${currentRSI.toFixed(2)}`);

      if (currentRSI <= this.parameters.extremeOversold) {
        strength += 15;
        confidence += 10;
        reasoning.push('Extreme oversold condition');
      }

      if (divergence.bullish) {
        strength += 10;
        confidence += 10;
        reasoning.push('Bullish divergence detected');
      }

      if (volumeSpike && this.parameters.volumeConfirmation) {
        confidence += 10;
        reasoning.push('Volume confirmation');
      }

      if (previousRSI < currentRSI) {
        confidence += 5;
        reasoning.push('RSI momentum improving');
      }
    }
    // Overbought conditions (Sell signals)
    else if (currentRSI >= this.parameters.overboughtLevel && trendBearish) {
      action = 'SELL';
      strength = Math.max(60, currentRSI * 1.2);
      confidence = 70;
      reasoning.push(`RSI overbought at ${currentRSI.toFixed(2)}`);

      if (currentRSI >= this.parameters.extremeOverbought) {
        strength += 15;
        confidence += 10;
        reasoning.push('Extreme overbought condition');
      }

      if (divergence.bearish) {
        strength += 10;
        confidence += 10;
        reasoning.push('Bearish divergence detected');
      }

      if (volumeSpike && this.parameters.volumeConfirmation) {
        confidence += 10;
        reasoning.push('Volume confirmation');
      }

      if (previousRSI > currentRSI) {
        confidence += 5;
        reasoning.push('RSI momentum deteriorating');
      }
    }

    // Risk management
    const atr = this.calculateATR(data.slice(-14));
    const volatilityMultiplier = Math.max(1.5, Math.min(3, currentRSI > 50 ? 2 : 2.5));

    return {
      action,
      strength: Math.min(strength, 100),
      confidence: Math.min(confidence, 95),
      entryPrice: currentPrice,
      stopLoss: action === 'BUY' 
        ? currentPrice - (atr * volatilityMultiplier)
        : currentPrice + (atr * volatilityMultiplier),
      takeProfit: action === 'BUY'
        ? currentPrice + (atr * volatilityMultiplier * 1.5)
        : currentPrice - (atr * volatilityMultiplier * 1.5),
      indicators,
      reasoning
    };
  }

  private detectDivergence(closes: number[], highs: number[], lows: number[], rsi: number[]): { bullish: boolean, bearish: boolean } {
    if (closes.length < 20 || rsi.length < 20) {
      return { bullish: false, bearish: false };
    }

    const recentPeriod = 10;
    const recentCloses = closes.slice(-recentPeriod);
    const recentHighs = highs.slice(-recentPeriod);
    const recentLows = lows.slice(-recentPeriod);
    const recentRSI = rsi.slice(-recentPeriod);

    // Bullish divergence: price makes lower low, RSI makes higher low
    const priceLowest = Math.min(...recentLows);
    const rsiAtPriceLow = recentRSI[recentLows.indexOf(priceLowest)];
    const currentRSI = recentRSI[recentRSI.length - 1];
    
    const bullishDivergence = priceLowest < lows[lows.length - recentPeriod - 5] && 
                             currentRSI > rsiAtPriceLow;

    // Bearish divergence: price makes higher high, RSI makes lower high
    const priceHighest = Math.max(...recentHighs);
    const rsiAtPriceHigh = recentRSI[recentHighs.indexOf(priceHighest)];
    
    const bearishDivergence = priceHighest > highs[highs.length - recentPeriod - 5] && 
                             currentRSI < rsiAtPriceHigh;

    return { bullish: bullishDivergence, bearish: bearishDivergence };
  }
}
