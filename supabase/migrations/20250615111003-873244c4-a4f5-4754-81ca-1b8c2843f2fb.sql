
-- Add phone number to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_number text;

-- Create notifications table for real-time alerts
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('trade_executed', 'trade_failed', 'price_alert', 'system', 'risk_warning')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create live orders table for real-time order management
CREATE TABLE public.live_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  exchange text NOT NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('BUY', 'SELL')),
  order_type text NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP_LOSS')),
  quantity numeric NOT NULL,
  price numeric,
  stop_price numeric,
  exchange_order_id text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'FAILED')),
  filled_quantity numeric DEFAULT 0,
  average_fill_price numeric,
  strategy_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  filled_at timestamp with time zone
);

-- Enable RLS for live orders
ALTER TABLE public.live_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for live orders
CREATE POLICY "Users can view their own live orders" 
  ON public.live_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own live orders" 
  ON public.live_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live orders" 
  ON public.live_orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create price alerts table
CREATE TABLE public.price_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  symbol text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('above', 'below')),
  target_price numeric NOT NULL,
  current_price numeric,
  is_active boolean NOT NULL DEFAULT true,
  triggered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for price alerts
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for price alerts
CREATE POLICY "Users can manage their own price alerts" 
  ON public.price_alerts 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Enable realtime for live trading tables
ALTER TABLE public.live_orders REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.price_alerts REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_alerts;

-- Update the handle_new_user function to include phone_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  
  INSERT INTO public.trading_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;
