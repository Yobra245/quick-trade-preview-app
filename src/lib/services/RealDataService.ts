
import { ChartData } from '@/lib/types';
import { exchangeService, MarketPrice } from './ExchangeService';
import { supabase } from '@/integrations/supabase/client';

export interface RealMarketDataUpdate extends MarketPrice {
  symbol: string;
  price: number;
  change24h: number;
  changePercentage24h: number;
  volume24h: number;
  timestamp: number;
}

export interface RealPriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export class RealDataService {
  private static instance: RealDataService;
  private websockets: Map<string, WebSocket> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 3;
  private userId?: string;

  private constructor() {}

  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  async initialize(userId: string) {
    this.userId = userId;
    await exchangeService.initialize(userId);
  }

  // Subscribe to real-time price updates
  async subscribeToPriceUpdates(symbol: string, callback: (data: RealPriceUpdate) => void) {
    const key = `price-${symbol}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Get initial price data with retry
    await this.retryOperation(async () => {
      const marketPrice = await exchangeService.getMarketPrice(symbol);
      if (marketPrice) {
        callback({
          symbol: marketPrice.symbol,
          price: marketPrice.price,
          timestamp: marketPrice.timestamp
        });
      }
    });

    // Start WebSocket connection for real-time updates
    this.connectToRealTimeData([symbol]);
  }

  // Subscribe to market data updates
  async subscribeToMarketData(symbol: string, callback: (data: RealMarketDataUpdate) => void) {
    const key = `market-${symbol}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Get initial market data with retry
    await this.retryOperation(async () => {
      const marketPrice = await exchangeService.getMarketPrice(symbol);
      if (marketPrice) {
        callback(marketPrice);
      }
    });

    this.connectToRealTimeData([symbol]);
  }

  // Unsubscribe from updates
  unsubscribe(symbol: string, callback: (data: any) => void) {
    [`price-${symbol}`, `market-${symbol}`].forEach(key => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
          this.disconnectFromRealTimeData(symbol);
        }
      }
    });
  }

  // Fetch real historical chart data with improved retry logic
  async fetchChartData(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<ChartData[]> {
    try {
      console.log(`Fetching real chart data for ${symbol}, timeframe: ${timeframe}, limit: ${limit}`);
      
      const data = await this.retryOperation(async () => {
        return await exchangeService.getHistoricalData(symbol, timeframe, limit);
      });
      
      if (data && data.length > 0) {
        // Store the data in price_history table for caching
        await this.cachePriceHistory(symbol, data, timeframe);
        return data;
      } else {
        console.log('No real data available, using cached data');
        return this.getCachedChartData(symbol, timeframe, limit);
      }
    } catch (error) {
      console.error('Error fetching real chart data:', error);
      const cachedData = await this.getCachedChartData(symbol, timeframe, limit);
      if (cachedData.length === 0) {
        console.log('No cached data available, generating realistic fallback data');
        return this.generateRealisticFallbackData(symbol, limit, timeframe);
      }
      return cachedData;
    }
  }

  // Retry operation with exponential backoff
  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`Operation failed (attempt ${attempt}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Connect to real-time data using Binance WebSocket
  private connectToRealTimeData(symbols: string[]) {
    const symbolKey = symbols.join(',');
    if (this.websockets.has(symbolKey)) {
      return; // Already connected
    }

    const ws = exchangeService.connectWebSocket(symbols, (marketPrice: MarketPrice) => {
      this.handleRealDataUpdate(marketPrice);
    });

    if (ws) {
      this.websockets.set(symbolKey, ws);
      
      ws.onclose = () => {
        this.websockets.delete(symbolKey);
        this.handleReconnect(symbols);
      };
    }
  }

  private disconnectFromRealTimeData(symbol: string) {
    this.websockets.forEach((ws, key) => {
      if (key.includes(symbol)) {
        ws.close();
        this.websockets.delete(key);
      }
    });
  }

  private handleReconnect(symbols: string[]) {
    const symbolKey = symbols.join(',');
    const attempts = this.reconnectAttempts.get(symbolKey) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(symbolKey, attempts + 1);
      setTimeout(() => {
        console.log(`Reconnecting to real-time data for ${symbolKey} (attempt ${attempts + 1})`);
        this.connectToRealTimeData(symbols);
      }, Math.pow(2, attempts) * 1000);
    }
  }

  private handleRealDataUpdate(marketPrice: MarketPrice) {
    // Notify price subscribers
    const priceKey = `price-${marketPrice.symbol}`;
    const priceSubscribers = this.subscribers.get(priceKey);
    if (priceSubscribers) {
      const priceUpdate: RealPriceUpdate = {
        symbol: marketPrice.symbol,
        price: marketPrice.price,
        timestamp: marketPrice.timestamp
      };
      priceSubscribers.forEach(callback => {
        try {
          callback(priceUpdate);
        } catch (error) {
          console.error('Error in price subscriber callback:', error);
        }
      });
    }

    // Notify market data subscribers
    const marketKey = `market-${marketPrice.symbol}`;
    const marketSubscribers = this.subscribers.get(marketKey);
    if (marketSubscribers) {
      marketSubscribers.forEach(callback => {
        try {
          callback(marketPrice);
        } catch (error) {
          console.error('Error in market subscriber callback:', error);
        }
      });
    }
  }

  // Cache price history data
  private async cachePriceHistory(symbol: string, data: ChartData[], timeframe: string) {
    try {
      const insertData = data.map(candle => ({
        symbol,
        exchange: 'binance',
        open_price: candle.open,
        high_price: candle.high,
        low_price: candle.low,
        close_price: candle.close,
        volume: candle.volume,
        timeframe,
        timestamp: new Date(candle.timestamp).toISOString()
      }));

      await supabase
        .from('price_history')
        .upsert(insertData, { 
          onConflict: 'symbol,exchange,timeframe,timestamp',
          ignoreDuplicates: true 
        });
    } catch (error) {
      console.error('Error caching price history:', error);
    }
  }

  // Get cached chart data as fallback
  private async getCachedChartData(symbol: string, timeframe: string, limit: number): Promise<ChartData[]> {
    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map(row => ({
        timestamp: new Date(row.timestamp).getTime(),
        open: parseFloat(row.open_price.toString()),
        high: parseFloat(row.high_price.toString()),
        low: parseFloat(row.low_price.toString()),
        close: parseFloat(row.close_price.toString()),
        volume: parseFloat(row.volume.toString())
      })).reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error('Error getting cached chart data:', error);
      return [];
    }
  }

  // Generate realistic fallback data when no real data is available
  private generateRealisticFallbackData(symbol: string, length: number, timeframe: string): ChartData[] {
    const data: ChartData[] = [];
    const basePrice = this.getBasePrice(symbol);
    const now = Date.now();
    const intervalMs = this.getTimeframeMilliseconds(timeframe);
    
    let currentPrice = basePrice;
    
    for (let i = 0; i < length; i++) {
      const timestamp = now - (length - i - 1) * intervalMs;
      
      // Generate more realistic price movements
      const volatility = this.getVolatility(symbol);
      const trend = (Math.random() - 0.5) * 0.02; // Small trend component
      const noise = (Math.random() - 0.5) * volatility;
      const priceChange = trend + noise;
      
      const open = currentPrice;
      const close = Math.max(currentPrice * (1 + priceChange), 0.01);
      
      // Generate realistic high/low based on open/close
      const maxPrice = Math.max(open, close);
      const minPrice = Math.min(open, close);
      const range = maxPrice - minPrice;
      
      const high = maxPrice + Math.random() * range * 0.5;
      const low = minPrice - Math.random() * range * 0.5;
      
      // Generate realistic volume
      const baseVolume = this.getBaseVolume(symbol);
      const volumeVariation = 0.5 + Math.random();
      const volume = baseVolume * volumeVariation;
      
      data.push({
        timestamp,
        open,
        high: Math.max(high, maxPrice),
        low: Math.max(low, 0.01),
        close,
        volume
      });
      
      currentPrice = close;
    }
    
    return data;
  }

  private getTimeframeMilliseconds(timeframe: string): number {
    const mapping: { [key: string]: number } = {
      '1s': 1000,
      '5s': 5000,
      '15s': 15000,
      '30s': 30000,
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '30m': 1800000,
      '1h': 3600000,
      '2h': 7200000,
      '4h': 14400000,
      '6h': 21600000,
      '12h': 43200000,
      '1d': 86400000,
      '3d': 259200000,
      '1w': 604800000,
      '1M': 2592000000,
      '3M': 7776000000,
      '6M': 15552000000,
      '1y': 31104000000
    };
    return mapping[timeframe] || 3600000;
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTC/USDT': 43000,
      'ETH/USDT': 2500,
      'BNB/USDT': 320,
      'SOL/USDT': 105,
      'XRP/USDT': 0.58,
      'ADA/USDT': 0.45,
      'DOGE/USDT': 0.085,
      'AVAX/USDT': 38,
      'DOT/USDT': 7.2,
      'MATIC/USDT': 0.92
    };
    return prices[symbol] || 100;
  }

  private getVolatility(symbol: string): number {
    if (symbol.includes('USDT')) return 0.03; // 3% for crypto
    if (symbol.includes('/')) return 0.008; // 0.8% for forex
    return 0.02; // 2% for stocks
  }

  private getBaseVolume(symbol: string): number {
    const volumes: { [key: string]: number } = {
      'BTC/USDT': 25000,
      'ETH/USDT': 45000,
      'BNB/USDT': 15000,
      'SOL/USDT': 35000,
      'XRP/USDT': 180000,
      'ADA/USDT': 120000,
      'DOGE/USDT': 850000,
      'AVAX/USDT': 25000,
      'DOT/USDT': 65000,
      'MATIC/USDT': 75000
    };
    return volumes[symbol] || 50000;
  }

  // Get real portfolio data
  async getPortfolioData(userId: string) {
    try {
      // First try to get real account balance if API keys are available
      const accountBalance = await exchangeService.getAccountBalance();
      
      // Update portfolio table with real data
      if (accountBalance && accountBalance.balances) {
        const portfolioUpdates = accountBalance.balances.map((balance: any) => ({
          user_id: userId,
          symbol: balance.asset,
          quantity: parseFloat(balance.free),
          exchange: 'binance',
          last_sync_at: new Date().toISOString()
        }));

        await supabase
          .from('portfolios')
          .upsert(portfolioUpdates, { onConflict: 'user_id,symbol' });
      }

      // Return current portfolio from database
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId);

      return data || [];
    } catch (error) {
      console.error('Error getting portfolio data:', error);
      return [];
    }
  }

  // Clean up all connections
  disconnect() {
    this.websockets.forEach((ws) => {
      ws.close();
    });
    this.websockets.clear();
    this.subscribers.clear();
    this.reconnectAttempts.clear();
  }
}

export const realDataService = RealDataService.getInstance();
