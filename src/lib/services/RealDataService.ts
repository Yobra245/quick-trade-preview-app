
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
  private maxReconnectAttempts = 5;
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

    // Get initial price data
    const marketPrice = await exchangeService.getMarketPrice(symbol);
    if (marketPrice) {
      callback({
        symbol: marketPrice.symbol,
        price: marketPrice.price,
        timestamp: marketPrice.timestamp
      });
    }

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

    // Get initial market data
    const marketPrice = await exchangeService.getMarketPrice(symbol);
    if (marketPrice) {
      callback(marketPrice);
    }

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

  // Fetch real historical chart data
  async fetchChartData(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<ChartData[]> {
    try {
      console.log(`Fetching real chart data for ${symbol}`);
      const data = await exchangeService.getHistoricalData(symbol, timeframe, limit);
      
      if (data.length === 0) {
        console.log('No real data available, using cached data');
        return this.getCachedChartData(symbol, timeframe, limit);
      }

      // Store the data in price_history table for caching
      await this.cachePriceHistory(symbol, data, timeframe);
      
      return data;
    } catch (error) {
      console.error('Error fetching real chart data:', error);
      return this.getCachedChartData(symbol, timeframe, limit);
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
        console.log('No cached data available, generating fallback data');
        return this.generateFallbackData(symbol, limit);
      }

      return data.map(row => ({
        timestamp: new Date(row.timestamp).getTime(),
        open: parseFloat(row.open_price),
        high: parseFloat(row.high_price),
        low: parseFloat(row.low_price),
        close: parseFloat(row.close_price),
        volume: parseFloat(row.volume)
      })).reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error('Error getting cached chart data:', error);
      return this.generateFallbackData(symbol, limit);
    }
  }

  // Generate minimal fallback data when no real data is available
  private generateFallbackData(symbol: string, length: number): ChartData[] {
    const data: ChartData[] = [];
    const basePrice = this.getBasePrice(symbol);
    const now = Date.now();
    const intervalMs = 3600000; // 1 hour
    
    for (let i = 0; i < length; i++) {
      const timestamp = now - (length - i) * intervalMs;
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.02); // 2% variance
      
      data.push({
        timestamp,
        open: price,
        high: price * 1.01,
        low: price * 0.99,
        close: price,
        volume: Math.random() * 1000000
      });
    }
    
    return data;
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTC/USDT': 51000,
      'ETH/USDT': 2850,
      'BNB/USDT': 590,
      'SOL/USDT': 148,
      'XRP/USDT': 0.53
    };
    return prices[symbol] || 100;
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
