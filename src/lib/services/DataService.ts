
import { ChartData } from '@/lib/types';
import { realDataService, RealDataService } from './RealDataService';
import { useAuth } from '@/hooks/useAuth';

export interface MarketDataUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercentage24h: number;
  volume24h: number;
  timestamp: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export class DataService {
  private static instance: DataService;
  private realDataService: RealDataService;
  private isInitialized = false;

  private constructor() {
    this.realDataService = realDataService;
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async initialize(userId?: string) {
    if (!this.isInitialized && userId) {
      await this.realDataService.initialize(userId);
      this.isInitialized = true;
      console.log('DataService initialized with real APIs');
    }
  }

  // Subscribe to real-time price updates
  async subscribeToPriceUpdates(symbol: string, callback: (data: PriceUpdate) => void) {
    if (!this.isInitialized) {
      console.warn('DataService not initialized, using fallback data');
      this.generateFallbackPriceUpdate(symbol, callback);
      return;
    }

    await this.realDataService.subscribeToPriceUpdates(symbol, callback);
  }

  // Subscribe to market data updates
  async subscribeToMarketData(symbol: string, callback: (data: MarketDataUpdate) => void) {
    if (!this.isInitialized) {
      console.warn('DataService not initialized, using fallback data');
      this.generateFallbackMarketUpdate(symbol, callback);
      return;
    }

    await this.realDataService.subscribeToMarketData(symbol, callback);
  }

  // Unsubscribe from updates
  unsubscribe(symbol: string, callback: (data: any) => void) {
    this.realDataService.unsubscribe(symbol, callback);
  }

  // Fetch historical chart data
  async fetchChartData(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<ChartData[]> {
    if (!this.isInitialized) {
      console.warn('DataService not initialized, generating fallback chart data');
      return this.generateFallbackChartData(symbol, limit, timeframe);
    }

    return await this.realDataService.fetchChartData(symbol, timeframe, limit);
  }

  // Fallback methods for when real data is not available
  private generateFallbackPriceUpdate(symbol: string, callback: (data: PriceUpdate) => void) {
    const basePrice = this.getBasePrice(symbol);
    const interval = setInterval(() => {
      const priceChange = (Math.random() - 0.5) * 0.01; // 1% max change
      const newPrice = basePrice * (1 + priceChange);
      
      callback({
        symbol,
        price: newPrice,
        timestamp: Date.now()
      });
    }, 5000); // Update every 5 seconds

    // Store interval for cleanup
    setTimeout(() => clearInterval(interval), 300000); // Stop after 5 minutes
  }

  private generateFallbackMarketUpdate(symbol: string, callback: (data: MarketDataUpdate) => void) {
    const basePrice = this.getBasePrice(symbol);
    const volatility = this.getVolatility(symbol);
    
    const interval = setInterval(() => {
      const priceChange = (Math.random() - 0.5) * volatility;
      const newPrice = basePrice * (1 + priceChange);
      
      callback({
        symbol,
        price: newPrice,
        change24h: priceChange * basePrice,
        changePercentage24h: priceChange * 100,
        volume24h: Math.random() * 1000000000,
        timestamp: Date.now()
      });
    }, 3000);

    setTimeout(() => clearInterval(interval), 300000);
  }

  private generateFallbackChartData(symbol: string, length: number, timeframe: string): ChartData[] {
    const data: ChartData[] = [];
    let lastClose = this.getBasePrice(symbol);
    const volatility = this.getVolatility(symbol) * this.getBasePrice(symbol);
    const now = Date.now();
    const intervalMs = this.getTimeframeMilliseconds(timeframe);
    
    for (let i = 0; i < length; i++) {
      const change = (Math.random() - 0.5) * volatility;
      const open = lastClose;
      const close = Math.max(1, lastClose + change);
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      
      data.push({
        timestamp: now - (length - i) * intervalMs,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000 + 100000
      });
      
      lastClose = close;
    }
    
    return data;
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTC/USDT': 51000,
      'ETH/USDT': 2850,
      'BNB/USDT': 590,
      'SOL/USDT': 148,
      'XRP/USDT': 0.53,
      'EUR/USD': 1.092,
      'GBP/USD': 1.263,
      'USD/JPY': 149.8,
      'AAPL': 190,
      'MSFT': 379,
      'GOOGL': 143
    };
    return prices[symbol] || 100;
  }

  private getVolatility(symbol: string): number {
    if (symbol.includes('USDT')) return 0.02;
    if (symbol.includes('/')) return 0.005;
    return 0.015;
  }

  private getTimeframeMilliseconds(timeframe: string): number {
    const mapping: { [key: string]: number } = {
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '30m': 1800000,
      '1h': 3600000,
      '4h': 14400000,
      '1d': 86400000,
      '1w': 604800000
    };
    return mapping[timeframe] || 3600000;
  }

  // Clean up all connections
  disconnect() {
    this.realDataService.disconnect();
  }
}

export const dataService = DataService.getInstance();
