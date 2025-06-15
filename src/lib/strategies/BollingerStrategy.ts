
import { BaseStrategy } from './StrategyEngine';
import { StrategySignal, MarketData, TechnicalIndicator } from './types';

export class BollingerStrategy extends BaseStrategy {
  getName(): string {
    return 'Bollinger Bands';
  }

  getDescription(): string {
    return 'Professional Bollinger Bands strategy with squeeze detection, bandwidth analysis, and mean reversion signals';
  }

  getDefaultParameters(): Record<string, any> {
    return {
      period: 20,
      standardDeviations: 2,
      squeezeThreshold: 0.1,
      bandwidthThreshold: 0.2,
      rsiConfirmation: true,
      volumeConfirmation: true,
      trendFilter: false,
      maFilterPeriod: 50
    };
  }

  analyze(data: MarketData[]): StrategySignal {
    if (data.length < this.parameters.period + 20) {
      return this.createNeutralSignal(data[data.length - 1]);
    }

    const closes = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    const currentPrice = closes[closes.length - 1];

    // Calculate Bollinger Bands
    const bands = this.calculateBollingerBands(closes, this.parameters.period, this.parameters.standardDeviations);
    
    if (bands.middle.length < 10) {
      return this.createNeutralSignal(data[data.length - 1]);
    }

    const currentUpper = bands.upper[bands.upper.length - 1];
    const currentMiddle = bands.middle[bands.middle.length - 1];
    const currentLower = bands.lower[bands.lower.length - 1];

    // Calculate additional indicators
    const rsi = this.parameters.rsiConfirmation ? this.calculateRSI(closes) : [];
    const currentRSI = rsi.length > 0 ? rsi[rsi.length - 1] : 50;

    // Bandwidth and squeeze analysis
    const bandwidth = (currentUpper - currentLower) / currentMiddle;
    const previousBandwidth = bands.upper.length > 1 ? 
      (bands.upper[bands.upper.length - 2] - bands.lower[bands.lower.length - 2]) / bands.middle[bands.middle.length - 2] : bandwidth;
    
    const squeeze = bandwidth < this.parameters.squeezeThreshold;
    const expansion = bandwidth > previousBandwidth * 1.1;

    // Price position within bands
    const bandPosition = (currentPrice - currentLower) / (currentUpper - currentLower);
    const priceNearUpper = bandPosition > 0.9;
    const priceNearLower = bandPosition < 0.1;
    const priceAtUpper = currentPrice >= currentUpper;
    const priceAtLower = currentPrice <= currentLower;

    // Volume analysis
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volumes[volumes.length - 1];
    const volumeConfirmed = !this.parameters.volumeConfirmation || currentVolume > avgVolume * 1.2;

    // Trend filter
    let trendBullish = true;
    let trendBearish = true;
    if (this.parameters.trendFilter) {
      const ma = this.calculateSMA(closes, this.parameters.maFilterPeriod);
      const currentMA = ma[ma.length - 1];
      trendBullish = currentPrice > currentMA;
      trendBearish = currentPrice < currentMA;
    }

    const indicators: TechnicalIndicator[] = [
      {
        name: 'BB Position',
        value: bandPosition * 100,
        signal: bandPosition > 0.5 ? 'BUY' : 'SELL',
        strength: Math.abs(bandPosition - 0.5) * 200
      },
      {
        name: 'Bandwidth',
        value: bandwidth * 100,
        signal: expansion ? 'BUY' : 'SELL',
        strength: bandwidth * 500
      }
    ];

    if (this.parameters.rsiConfirmation) {
      indicators.push({
        name: 'RSI',
        value: currentRSI,
        signal: currentRSI > 50 ? 'BUY' : 'SELL',
        strength: Math.abs(currentRSI - 50) * 2
      });
    }

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let strength = 0;
    let confidence = 0;
    const reasoning: string[] = [];

    // Buy signals
    if ((priceAtLower || priceNearLower) && volumeConfirmed && trendBullish) {
      action = 'BUY';
      strength = 70;
      confidence = 75;
      reasoning.push('Price touching or near lower Bollinger Band');

      if (priceAtLower) {
        strength += 10;
        confidence += 10;
        reasoning.push('Price at lower band - strong mean reversion signal');
      }

      if (squeeze) {
        strength += 15;
        confidence += 10;
        reasoning.push('Bollinger Band squeeze detected - volatility expansion expected');
      }

      if (this.parameters.rsiConfirmation && currentRSI < 40) {
        strength += 10;
        confidence += 10;
        reasoning.push('RSI confirms oversold condition');
      }

      if (expansion) {
        strength += 5;
        reasoning.push('Band expansion supports directional move');
      }
    }
    // Sell signals
    else if ((priceAtUpper || priceNearUpper) && volumeConfirmed && trendBearish) {
      action = 'SELL';
      strength = 70;
      confidence = 75;
      reasoning.push('Price touching or near upper Bollinger Band');

      if (priceAtUpper) {
        strength += 10;
        confidence += 10;
        reasoning.push('Price at upper band - strong mean reversion signal');
      }

      if (squeeze) {
        strength += 15;
        confidence += 10;
        reasoning.push('Bollinger Band squeeze detected - volatility expansion expected');
      }

      if (this.parameters.rsiConfirmation && currentRSI > 60) {
        strength += 10;
        confidence += 10;
        reasoning.push('RSI confirms overbought condition');
      }

      if (expansion) {
        strength += 5;
        reasoning.push('Band expansion supports directional move');
      }
    }
    // Squeeze breakout signals
    else if (squeeze && expansion && volumeConfirmed) {
      if (currentPrice > currentMiddle) {
        action = 'BUY';
        reasoning.push('Bullish breakout from Bollinger Band squeeze');
      } else {
        action = 'SELL';
        reasoning.push('Bearish breakout from Bollinger Band squeeze');
      }
      
      strength = 80;
      confidence = 85;
      reasoning.push('High probability squeeze breakout pattern');
    }

    // Risk management based on bandwidth
    const atr = this.calculateATR(data.slice(-14));
    const riskMultiplier = Math.max(1.5, Math.min(3, bandwidth * 10));

    return {
      action,
      strength: Math.min(strength, 100),
      confidence: Math.min(confidence, 95),
      entryPrice: currentPrice,
      stopLoss: action === 'BUY' 
        ? Math.min(currentPrice - (atr * riskMultiplier), currentLower)
        : Math.max(currentPrice + (atr * riskMultiplier), currentUpper),
      takeProfit: action === 'BUY'
        ? Math.max(currentPrice + (atr * riskMultiplier * 1.5), currentMiddle)
        : Math.min(currentPrice - (atr * riskMultiplier * 1.5), currentMiddle),
      indicators,
      reasoning
    };
  }

  private calculateATR(data: MarketData[], period: number = 14): number {
    const trueRanges = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }

    return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  private createNeutralSignal(currentData: MarketData): StrategySignal {
    return {
      action: 'HOLD',
      strength: 0,
      confidence: 0,
      entryPrice: currentData.close,
      stopLoss: currentData.close,
      takeProfit: currentData.close,
      indicators: [],
      reasoning: ['Insufficient data for analysis']
    };
  }
}
