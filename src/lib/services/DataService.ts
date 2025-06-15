import { ChartData } from '@/lib/types';

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
  private websockets: Map<string, WebSocket> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Subscribe to real-time price updates
  subscribeToPriceUpdates(symbol: string, callback: (data: PriceUpdate) => void) {
    const key = `price-${symbol}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Start WebSocket connection if not already connected
    this.connectToMarketData(symbol);
  }

  // Subscribe to market data updates
  subscribeToMarketData(symbol: string, callback: (data: MarketDataUpdate) => void) {
    const key = `market-${symbol}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    this.connectToMarketData(symbol);
  }

  // Unsubscribe from updates
  unsubscribe(symbol: string, callback: (data: any) => void) {
    [`price-${symbol}`, `market-${symbol}`].forEach(key => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
          this.disconnectFromMarketData(symbol);
        }
      }
    });
  }

  // Connect to WebSocket for real-time data
  private connectToMarketData(symbol: string) {
    if (this.websockets.has(symbol)) {
      return; // Already connected
    }

    // Use different WebSocket URLs based on market type
    const wsUrl = this.getWebSocketUrl(symbol);
    if (!wsUrl) {
      console.warn(`No WebSocket URL available for ${symbol}`);
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connected for ${symbol}`);
        this.reconnectAttempts.set(symbol, 0);
        
        // Subscribe to the symbol
        const subscribeMessage = this.getSubscribeMessage(symbol);
        if (subscribeMessage) {
          ws.send(JSON.stringify(subscribeMessage));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMarketDataUpdate(symbol, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log(`WebSocket disconnected for ${symbol}`);
        this.websockets.delete(symbol);
        this.handleReconnect(symbol);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${symbol}:`, error);
      };

      this.websockets.set(symbol, ws);
    } catch (error) {
      console.error(`Failed to connect WebSocket for ${symbol}:`, error);
    }
  }

  private disconnectFromMarketData(symbol: string) {
    const ws = this.websockets.get(symbol);
    if (ws) {
      ws.close();
      this.websockets.delete(symbol);
    }
  }

  private handleReconnect(symbol: string) {
    const attempts = this.reconnectAttempts.get(symbol) || 0;
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(symbol, attempts + 1);
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket for ${symbol} (attempt ${attempts + 1})`);
        this.connectToMarketData(symbol);
      }, Math.pow(2, attempts) * 1000); // Exponential backoff
    }
  }

  private getWebSocketUrl(symbol: string): string | null {
    // Determine market type and return appropriate WebSocket URL
    if (symbol.includes('USDT') || symbol.includes('BTC') || symbol.includes('ETH')) {
      // Crypto - Binance WebSocket
      return 'wss://stream.binance.com:9443/ws/stream';
    } else if (symbol.includes('/')) {
      // Forex - using a free forex API WebSocket (example)
      return `wss://ws.finnhub.io?token=demo_token`;
    } else {
      // Stocks - using a demo WebSocket
      return `wss://ws.finnhub.io?token=demo_token`;
    }
  }

  private getSubscribeMessage(symbol: string): any {
    if (symbol.includes('USDT')) {
      // Binance format
      const binanceSymbol = symbol.replace('/', '').toLowerCase();
      return {
        method: 'SUBSCRIBE',
        params: [`${binanceSymbol}@ticker`],
        id: Date.now()
      };
    } else {
      // Finnhub format for forex/stocks
      return {
        type: 'subscribe',
        symbol: symbol
      };
    }
  }

  private handleMarketDataUpdate(symbol: string, data: any) {
    // Parse different data formats from different sources
    let update: MarketDataUpdate | PriceUpdate;

    if (data.stream && data.stream.includes('@ticker')) {
      // Binance ticker data
      const tickerData = data.data;
      update = {
        symbol: symbol,
        price: parseFloat(tickerData.c),
        change24h: parseFloat(tickerData.P),
        changePercentage24h: parseFloat(tickerData.P),
        volume24h: parseFloat(tickerData.v),
        timestamp: Date.now()
      };
    } else if (data.type === 'trade') {
      // Finnhub trade data
      update = {
        symbol: symbol,
        price: data.p,
        timestamp: data.t
      };
    } else {
      // Fallback - simulate realistic data
      update = this.generateSimulatedUpdate(symbol);
    }

    // Notify subscribers
    this.notifySubscribers(symbol, update);
  }

  private generateSimulatedUpdate(symbol: string): MarketDataUpdate {
    // Generate realistic price movements
    const basePrice = this.getBasePrice(symbol);
    const volatility = this.getVolatility(symbol);
    
    const priceChange = (Math.random() - 0.5) * volatility;
    const newPrice = basePrice * (1 + priceChange);
    
    return {
      symbol,
      price: newPrice,
      change24h: priceChange * basePrice,
      changePercentage24h: priceChange * 100,
      volume24h: Math.random() * 1000000000,
      timestamp: Date.now()
    };
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
    if (symbol.includes('USDT')) return 0.02; // 2% crypto volatility
    if (symbol.includes('/')) return 0.005; // 0.5% forex volatility
    return 0.015; // 1.5% stock volatility
  }

  private notifySubscribers(symbol: string, update: any) {
    [`price-${symbol}`, `market-${symbol}`].forEach(key => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.forEach(callback => {
          try {
            callback(update);
          } catch (error) {
            console.error('Error in subscriber callback:', error);
          }
        });
      }
    });
  }

  // Fetch historical chart data
  async fetchChartData(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<ChartData[]> {
    try {
      // Try to fetch real data first, fallback to simulated
      const data = await this.fetchRealChartData(symbol, timeframe, limit);
      return data || this.generateChartData(symbol, limit);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return this.generateChartData(symbol, limit);
    }
  }

  private async fetchRealChartData(symbol: string, timeframe: string, limit: number): Promise<ChartData[] | null> {
    if (symbol.includes('USDT')) {
      // Binance REST API
      try {
        const binanceSymbol = symbol.replace('/', '');
        const interval = this.mapTimeframeToInterval(timeframe);
        const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data.map((kline: any[]) => ({
          timestamp: kline[0],
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5])
        }));
      } catch (error) {
        console.error('Binance API error:', error);
        return null;
      }
    }
    
    // For forex/stocks, we'll use simulated data for now
    return null;
  }

  private mapTimeframeToInterval(timeframe: string): string {
    const mapping: { [key: string]: string } = {
      // Seconds
      '1s': '1s',
      '5s': '5s',
      '15s': '15s',
      '30s': '30s',
      
      // Minutes
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      
      // Hours
      '1h': '1h',
      '2h': '2h',
      '4h': '4h',
      '6h': '6h',
      '12h': '12h',
      
      // Days
      '1d': '1d',
      '3d': '3d',
      '1w': '1w',
      
      // Months/Years (Binance doesn't support these directly, so we use 1d and aggregate)
      '1M': '1M',
      '3M': '3M',
      '6M': '6M',
      '1y': '1y'
    };
    return mapping[timeframe] || '1h';
  }

  private getTimeframeMilliseconds(timeframe: string): number {
    const mapping: { [key: string]: number } = {
      // Seconds
      '1s': 1000,
      '5s': 5000,
      '15s': 15000,
      '30s': 30000,
      
      // Minutes
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '30m': 1800000,
      
      // Hours
      '1h': 3600000,
      '2h': 7200000,
      '4h': 14400000,
      '6h': 21600000,
      '12h': 43200000,
      
      // Days
      '1d': 86400000,
      '3d': 259200000,
      '1w': 604800000,
      
      // Months/Years (approximate)
      '1M': 2629746000, // 30.44 days
      '3M': 7889238000, // 91.31 days
      '6M': 15778476000, // 182.62 days
      '1y': 31556952000 // 365.25 days
    };
    return mapping[timeframe] || 3600000; // Default to 1 hour
  }

  private generateChartData(symbol: string, length: number, timeframe: string = '1h'): ChartData[] {
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

export const dataService = DataService.getInstance();
