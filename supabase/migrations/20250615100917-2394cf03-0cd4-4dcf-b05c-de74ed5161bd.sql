
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trading profiles table for trading-specific data
CREATE TABLE public.trading_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  exchange_api_key TEXT,
  exchange_secret_key TEXT, -- This will be encrypted
  preferred_exchange TEXT DEFAULT 'binance',
  risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  max_position_size DECIMAL(10,2) DEFAULT 1000.00,
  auto_trading_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  quantity DECIMAL(18,8) NOT NULL DEFAULT 0,
  average_price DECIMAL(18,8),
  current_value DECIMAL(18,2),
  profit_loss DECIMAL(18,2),
  profit_loss_percentage DECIMAL(8,4),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity DECIMAL(18,8) NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  total_amount DECIMAL(18,2) NOT NULL,
  exchange_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED', 'FAILED')),
  strategy_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  filled_at TIMESTAMP WITH TIME ZONE
);

-- Create user strategies table
CREATE TABLE public.user_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strategy_name TEXT NOT NULL,
  strategy_type TEXT NOT NULL,
  parameters JSONB,
  symbols TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_strategies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for trading_profiles
CREATE POLICY "Users can view their own trading profile" ON public.trading_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own trading profile" ON public.trading_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trading profile" ON public.trading_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for portfolios
CREATE POLICY "Users can view their own portfolio" ON public.portfolios
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio" ON public.portfolios
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own portfolio" ON public.portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolio items" ON public.portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for trades
CREATE POLICY "Users can view their own trades" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trades" ON public.trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trades" ON public.trades
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_strategies
CREATE POLICY "Users can view their own strategies" ON public.user_strategies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own strategies" ON public.user_strategies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own strategies" ON public.user_strategies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own strategies" ON public.user_strategies
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  INSERT INTO public.trading_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_user_strategies_user_id ON public.user_strategies(user_id);
