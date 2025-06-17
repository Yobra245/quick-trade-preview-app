
-- Create table for storing encrypted API credentials
CREATE TABLE IF NOT EXISTS public.api_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  exchange TEXT NOT NULL,
  api_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  passphrase TEXT,
  sandbox_mode BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exchange)
);

-- Create table for caching market data to reduce API calls
CREATE TABLE IF NOT EXISTS public.market_data_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  price NUMERIC NOT NULL,
  volume_24h NUMERIC,
  change_24h NUMERIC,
  change_percentage_24h NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, exchange)
);

-- Create table for real-time price history
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  open_price NUMERIC NOT NULL,
  high_price NUMERIC NOT NULL,
  low_price NUMERIC NOT NULL,
  close_price NUMERIC NOT NULL,
  volume NUMERIC NOT NULL,
  timeframe TEXT NOT NULL, -- '1m', '5m', '1h', '1d', etc.
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, exchange, timeframe, timestamp)
);

-- Create table for API usage tracking and rate limiting
CREATE TABLE IF NOT EXISTS public.api_usage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  exchange TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  last_request_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing trades table to include more real trading data
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS exchange TEXT DEFAULT 'binance',
ADD COLUMN IF NOT EXISTS fees NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS executed_price NUMERIC,
ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'market',
ADD COLUMN IF NOT EXISTS time_in_force TEXT DEFAULT 'GTC';

-- Update portfolios table for real balance tracking
ALTER TABLE public.portfolios
ADD COLUMN IF NOT EXISTS exchange TEXT DEFAULT 'binance',
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on new tables
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for api_credentials
CREATE POLICY "Users can manage their own API credentials" 
  ON public.api_credentials 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for market_data_cache (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read market data cache" 
  ON public.market_data_cache 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create RLS policies for price_history (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read price history" 
  ON public.price_history 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create RLS policies for api_usage_log
CREATE POLICY "Users can view their own API usage" 
  ON public.api_usage_log 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_market_data_cache_symbol_exchange ON public.market_data_cache(symbol, exchange);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_timeframe ON public.price_history(symbol, timeframe, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_exchange ON public.api_usage_log(user_id, exchange, last_request_at);

-- Create function to update market data cache
CREATE OR REPLACE FUNCTION update_market_data_cache(
  p_symbol TEXT,
  p_exchange TEXT,
  p_price NUMERIC,
  p_volume_24h NUMERIC DEFAULT NULL,
  p_change_24h NUMERIC DEFAULT NULL,
  p_change_percentage_24h NUMERIC DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.market_data_cache (symbol, exchange, price, volume_24h, change_24h, change_percentage_24h)
  VALUES (p_symbol, p_exchange, p_price, p_volume_24h, p_change_24h, p_change_percentage_24h)
  ON CONFLICT (symbol, exchange) 
  DO UPDATE SET 
    price = EXCLUDED.price,
    volume_24h = EXCLUDED.volume_24h,
    change_24h = EXCLUDED.change_24h,
    change_percentage_24h = EXCLUDED.change_percentage_24h,
    timestamp = now();
END;
$$;
