
import { supabase } from '@/integrations/supabase/client';

export interface ExchangeCredentials {
  apiKey: string;
  secretKey: string;
  passphrase?: string;
  sandboxMode: boolean;
}

export interface MarketPrice {
  symbol: string;
  price: number;
  change24h: number;
  changePercentage24h: number;
  volume24h: number;
  timestamp: number;
}

export interface OrderBookData {
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export interface TradeData {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
}

export class ExchangeService {
  private static instance: ExchangeService;
  private apiKey?: string;
  private secretKey?: string;
  private exchange?: string;

  private constructor() {}

  static getInstance(): ExchangeService {
    if (!ExchangeService.instance) {
      ExchangeService.instance = new ExchangeService();
    }
    return ExchangeService.instance;
  }

  async initialize(userId: string, exchange: string = 'binance'): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('api_key, secret_key, passphrase, sandbox_mode')
        .eq('user_id', userId)
        .eq('exchange', exchange)
        .eq('is_active', true)
        .single();

      if (error) {
        console.log('No API credentials found, using public endpoints only');
        this.exchange = exchange;
        return false;
      }

      this.apiKey = data.api_key;
      this.secretKey = data.secret_key;
      this.exchange = exchange;
      return true;
    } catch (error) {
      console.error('Failed to initialize exchange service:', error);
      return false;
    }
  }

  // Fetch real market prices using our Supabase proxy
  async getMarketPrice(symbol: string): Promise<MarketPrice | null> {
    try {
      console.log(`Fetching market price for ${symbol} via proxy`);
      
      const { data, error } = await supabase.functions.invoke('binance-proxy', {
        body: JSON.stringify({
          endpoint: 'ticker',
          symbol: symbol
        })
      });
      
      if (error) {
        console.error('Proxy error:', error);
        throw error;
      }
      
      if (!data || data.error) {
        throw new Error(data?.error || 'No data received from proxy');
      }
      
      const marketPrice: MarketPrice = {
        symbol,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChange),
        changePercentage24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.volume),
        timestamp: Date.now()
      };

      // Cache the data in Supabase
      await this.cacheMarketData(marketPrice);
      
      return marketPrice;
    } catch (error) {
      console.error(`Error fetching market price for ${symbol}:`, error);
      return this.getCachedMarketData(symbol);
    }
  }

  // Fetch multiple market prices
  async getMarketPrices(symbols: string[]): Promise<MarketPrice[]> {
    const promises = symbols.map(symbol => this.getMarketPrice(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<MarketPrice> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  // Fetch historical OHLCV data using our Supabase proxy
  async getHistoricalData(symbol: string, interval: string = '1h', limit: number = 100) {
    try {
      console.log(`Fetching historical data for ${symbol} via proxy`);
      
      const { data, error } = await supabase.functions.invoke('binance-proxy', {
        body: JSON.stringify({
          endpoint: 'klines',
          symbol: symbol,
          interval: interval,
          limit: limit.toString()
        })
      });
      
      if (error) {
        console.error('Proxy error:', error);
        throw error;
      }
      
      if (!data || data.error) {
        throw new Error(data?.error || 'No data received from proxy');
      }
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from proxy');
      }
      
      return data.map((kline: any[]) => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  // Get account balance (requires API keys)
  async getAccountBalance(): Promise<any> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('API credentials required for account balance');
    }

    // This would require proper authentication implementation
    // For now, return mock data until we implement crypto signing
    return {
      balances: [
        { asset: 'BTC', free: '0.5', locked: '0.0' },
        { asset: 'USDT', free: '1000.0', locked: '0.0' },
        { asset: 'ETH', free: '2.5', locked: '0.0' }
      ]
    };
  }

  // Cache market data in Supabase using RPC function
  private async cacheMarketData(marketPrice: MarketPrice) {
    try {
      await supabase.rpc('update_market_data_cache', {
        p_symbol: marketPrice.symbol,
        p_exchange: this.exchange || 'binance',
        p_price: marketPrice.price,
        p_volume_24h: marketPrice.volume24h,
        p_change_24h: marketPrice.change24h,
        p_change_percentage_24h: marketPrice.changePercentage24h
      });
    } catch (error) {
      console.error('Error caching market data:', error);
    }
  }

  // Get cached market data as fallback
  private async getCachedMarketData(symbol: string): Promise<MarketPrice | null> {
    try {
      const { data, error } = await supabase
        .from('market_data_cache')
        .select('*')
        .eq('symbol', symbol)
        .eq('exchange', this.exchange || 'binance')
        .single();

      if (error || !data) return null;

      return {
        symbol: data.symbol,
        price: parseFloat(data.price.toString()),
        change24h: parseFloat(data.change_24h?.toString() || '0'),
        changePercentage24h: parseFloat(data.change_percentage_24h?.toString() || '0'),
        volume24h: parseFloat(data.volume_24h?.toString() || '0'),
        timestamp: new Date(data.timestamp).getTime()
      };
    } catch (error) {
      console.error('Error getting cached market data:', error);
      return null;
    }
  }

  // WebSocket connection for real-time data
  connectWebSocket(symbols: string[], callback: (data: any) => void): WebSocket | null {
    try {
      const streams = symbols
        .map(symbol => symbol.replace('/', '').toLowerCase() + '@ticker')
        .join('/');
      
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const marketPrice: MarketPrice = {
            symbol: data.s.replace(/(\w+)USDT/, '$1/USDT'), // Convert back to our format
            price: parseFloat(data.c),
            change24h: parseFloat(data.P),
            changePercentage24h: parseFloat(data.P),
            volume24h: parseFloat(data.v),
            timestamp: data.E
          };
          callback(marketPrice);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      return null;
    }
  }
}

export const exchangeService = ExchangeService.getInstance();
