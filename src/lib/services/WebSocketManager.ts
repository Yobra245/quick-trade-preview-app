
interface WebSocketStream {
  symbol: string;
  type: 'kline' | 'ticker' | 'depth' | 'trade';
  interval?: string;
  callback: (data: any) => void;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocket> = new Map();
  private streams: Map<string, WebSocketStream[]> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private baseUrl = 'wss://stream.binance.com:9443/ws/';
  private isReconnecting = false;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // Subscribe to real-time kline (candlestick) data
  subscribeToKlines(symbol: string, interval: string, callback: (data: any) => void): string {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const streamId = `${symbol}_${interval}_kline`;
    
    this.addStream(streamId, {
      symbol,
      type: 'kline',
      interval,
      callback
    });

    this.connectToStream(streamName, streamId);
    return streamId;
  }

  // Subscribe to real-time ticker data
  subscribeToTicker(symbol: string, callback: (data: any) => void): string {
    const streamName = `${symbol.toLowerCase()}@ticker`;
    const streamId = `${symbol}_ticker`;
    
    this.addStream(streamId, {
      symbol,
      type: 'ticker',
      callback
    });

    this.connectToStream(streamName, streamId);
    return streamId;
  }

  // Subscribe to order book depth
  subscribeToDepth(symbol: string, callback: (data: any) => void): string {
    const streamName = `${symbol.toLowerCase()}@depth20@100ms`;
    const streamId = `${symbol}_depth`;
    
    this.addStream(streamId, {
      symbol,
      type: 'depth',
      callback
    });

    this.connectToStream(streamName, streamId);
    return streamId;
  }

  // Subscribe to individual trades
  subscribeToTrades(symbol: string, callback: (data: any) => void): string {
    const streamName = `${symbol.toLowerCase()}@trade`;
    const streamId = `${symbol}_trade`;
    
    this.addStream(streamId, {
      symbol,
      type: 'trade',
      callback
    });

    this.connectToStream(streamName, streamId);
    return streamId;
  }

  private addStream(streamId: string, stream: WebSocketStream) {
    if (!this.streams.has(streamId)) {
      this.streams.set(streamId, []);
    }
    this.streams.get(streamId)!.push(stream);
  }

  private connectToStream(streamName: string, streamId: string) {
    if (this.connections.has(streamName)) {
      return; // Already connected
    }

    console.log(`Connecting to WebSocket stream: ${streamName}`);
    
    const ws = new WebSocket(`${this.baseUrl}${streamName}`);
    this.connections.set(streamName, ws);

    ws.onopen = () => {
      console.log(`WebSocket connected: ${streamName}`);
      this.reconnectAttempts.set(streamName, 0);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(streamId, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${streamName}:`, error);
    };

    ws.onclose = (event) => {
      console.log(`WebSocket closed for ${streamName}:`, event.code, event.reason);
      this.connections.delete(streamName);
      
      if (!this.isReconnecting) {
        this.handleReconnect(streamName, streamId);
      }
    };
  }

  private handleMessage(streamId: string, data: any) {
    const streams = this.streams.get(streamId);
    if (!streams) return;

    streams.forEach(stream => {
      try {
        // Transform data based on stream type
        let transformedData;
        
        switch (stream.type) {
          case 'kline':
            transformedData = this.transformKlineData(data);
            break;
          case 'ticker':
            transformedData = this.transformTickerData(data);
            break;
          case 'depth':
            transformedData = this.transformDepthData(data);
            break;
          case 'trade':
            transformedData = this.transformTradeData(data);
            break;
          default:
            transformedData = data;
        }

        stream.callback(transformedData);
      } catch (error) {
        console.error('Error in stream callback:', error);
      }
    });
  }

  private transformKlineData(data: any) {
    const kline = data.k;
    return {
      symbol: kline.s,
      timestamp: kline.t,
      closeTime: kline.T,
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
      volume: parseFloat(kline.v),
      trades: kline.n,
      interval: kline.i,
      isClosed: kline.x, // Important: tells us if this kline is finalized
      quoteVolume: parseFloat(kline.q),
      buyVolume: parseFloat(kline.V),
      buyQuoteVolume: parseFloat(kline.Q)
    };
  }

  private transformTickerData(data: any) {
    return {
      symbol: data.s,
      price: parseFloat(data.c),
      change: parseFloat(data.P),
      changePercent: parseFloat(data.P),
      volume: parseFloat(data.v),
      high: parseFloat(data.h),
      low: parseFloat(data.l),
      open: parseFloat(data.o),
      timestamp: data.E
    };
  }

  private transformDepthData(data: any) {
    return {
      symbol: data.s,
      bids: data.b.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
      asks: data.a.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
      timestamp: Date.now()
    };
  }

  private transformTradeData(data: any) {
    return {
      symbol: data.s,
      price: parseFloat(data.p),
      quantity: parseFloat(data.q),
      timestamp: data.T,
      isBuyerMaker: data.m,
      tradeId: data.t
    };
  }

  private handleReconnect(streamName: string, streamId: string) {
    const attempts = this.reconnectAttempts.get(streamName) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
      this.reconnectAttempts.set(streamName, attempts + 1);
      
      console.log(`Reconnecting to ${streamName} in ${delay}ms (attempt ${attempts + 1})`);
      
      setTimeout(() => {
        this.isReconnecting = true;
        this.connectToStream(streamName, streamId);
        this.isReconnecting = false;
      }, delay);
    } else {
      console.error(`Max reconnection attempts reached for ${streamName}`);
    }
  }

  // Unsubscribe from a stream
  unsubscribe(streamId: string) {
    this.streams.delete(streamId);
    
    // Check if any other streams are using this connection
    const streamName = Array.from(this.connections.keys()).find(name => 
      name.includes(streamId.split('_')[0].toLowerCase())
    );
    
    if (streamName) {
      const ws = this.connections.get(streamName);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      this.connections.delete(streamName);
    }
  }

  // Clean up all connections
  disconnect() {
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.connections.clear();
    this.streams.clear();
    this.reconnectAttempts.clear();
  }

  // Get connection status
  getConnectionStatus(streamId: string): 'connecting' | 'connected' | 'disconnected' {
    const streamName = Array.from(this.connections.keys()).find(name => 
      name.includes(streamId.split('_')[0].toLowerCase())
    );
    
    if (!streamName) return 'disconnected';
    
    const ws = this.connections.get(streamName);
    if (!ws) return 'disconnected';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      default:
        return 'disconnected';
    }
  }
}

export const webSocketManager = WebSocketManager.getInstance();
