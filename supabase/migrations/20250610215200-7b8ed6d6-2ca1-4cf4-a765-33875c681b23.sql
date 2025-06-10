
-- Create table for global transaction feed (order book style)
CREATE TABLE IF NOT EXISTS public.global_transaction_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id),
  user_id UUID REFERENCES public.profiles(id),
  transaction_type TEXT NOT NULL, -- 'send', 'receive', 'buy', 'sell', 'stake', 'unstake', 'mining_reward'
  amount NUMERIC NOT NULL,
  price NUMERIC DEFAULT 850, -- GCoin price at time of transaction
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for GCoin price history/chart data
CREATE TABLE IF NOT EXISTS public.gcoin_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price NUMERIC NOT NULL DEFAULT 850,
  volume NUMERIC NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  market_cap NUMERIC,
  change_24h NUMERIC DEFAULT 0
);

-- Create table for tracking user login activity with IP addresses
CREATE TABLE IF NOT EXISTS public.user_login_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success' -- 'success', 'failed'
);

-- Enable RLS on new tables
ALTER TABLE public.global_transaction_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcoin_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view global transaction feed" ON public.global_transaction_feed;
DROP POLICY IF EXISTS "Anyone can view price history" ON public.gcoin_price_history;
DROP POLICY IF EXISTS "Admins can view login history" ON public.user_login_history;

-- RLS policies for global_transaction_feed (public read)
CREATE POLICY "Anyone can view global transaction feed" 
  ON public.global_transaction_feed 
  FOR SELECT 
  USING (true);

-- RLS policies for gcoin_price_history (public read)
CREATE POLICY "Anyone can view price history" 
  ON public.gcoin_price_history 
  FOR SELECT 
  USING (true);

-- RLS policies for user_login_history (admin only)
CREATE POLICY "Admins can view login history" 
  ON public.user_login_history 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_accounts WHERE id = auth.uid()
  ));

-- Insert sample data for global transaction feed (only if table is empty)
INSERT INTO public.global_transaction_feed (transaction_type, amount, price, wallet_address, timestamp) 
SELECT 'buy', 1500, 850, 'gCoinabcd1234', now() - interval '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM public.global_transaction_feed LIMIT 1);

INSERT INTO public.global_transaction_feed (transaction_type, amount, price, wallet_address, timestamp) 
SELECT 'sell', 750, 848, 'gCoinefgh5678', now() - interval '45 minutes'
WHERE (SELECT COUNT(*) FROM public.global_transaction_feed) = 1;

INSERT INTO public.global_transaction_feed (transaction_type, amount, price, wallet_address, timestamp) 
SELECT 'send', 200, 850, 'gCoinijkl9012', now() - interval '30 minutes'
WHERE (SELECT COUNT(*) FROM public.global_transaction_feed) = 2;

INSERT INTO public.global_transaction_feed (transaction_type, amount, price, wallet_address, timestamp) 
SELECT 'buy', 2000, 852, 'gCoinmnop3456', now() - interval '25 minutes'
WHERE (SELECT COUNT(*) FROM public.global_transaction_feed) = 3;

INSERT INTO public.global_transaction_feed (transaction_type, amount, price, wallet_address, timestamp) 
SELECT 'sell', 300, 851, 'gCoinqrst7890', now() - interval '20 minutes'
WHERE (SELECT COUNT(*) FROM public.global_transaction_feed) = 4;

INSERT INTO public.global_transaction_feed (transaction_type, amount, price, wallet_address, timestamp) 
SELECT 'send', 150, 851, 'gCoinuvwx1234', now() - interval '15 minutes'
WHERE (SELECT COUNT(*) FROM public.global_transaction_feed) = 5;

INSERT INTO public.global_transaction_feed (transaction_type, amount, price, wallet_address, timestamp) 
SELECT 'buy', 500, 853, 'gCoinyzab5678', now() - interval '10 minutes'
WHERE (SELECT COUNT(*) FROM public.global_transaction_feed) = 6;

INSERT INTO public.global_transaction_feed (transaction_type, amount, price, wallet_address, timestamp) 
SELECT 'mining_reward', 100, 853, 'gCoincd9012', now() - interval '5 minutes'
WHERE (SELECT COUNT(*) FROM public.global_transaction_feed) = 7;

-- Insert sample price history data (only if table is empty)
INSERT INTO public.gcoin_price_history (price, volume, timestamp, change_24h) 
SELECT 845, 15000, now() - interval '24 hours', -0.5
WHERE NOT EXISTS (SELECT 1 FROM public.gcoin_price_history LIMIT 1);

INSERT INTO public.gcoin_price_history (price, volume, timestamp, change_24h) 
SELECT 848, 18000, now() - interval '20 hours', 0.2
WHERE (SELECT COUNT(*) FROM public.gcoin_price_history) = 1;

INSERT INTO public.gcoin_price_history (price, volume, timestamp, change_24h) 
SELECT 850, 22000, now() - interval '16 hours', 0.8
WHERE (SELECT COUNT(*) FROM public.gcoin_price_history) = 2;

INSERT INTO public.gcoin_price_history (price, volume, timestamp, change_24h) 
SELECT 849, 19000, now() - interval '12 hours', -0.1
WHERE (SELECT COUNT(*) FROM public.gcoin_price_history) = 3;

INSERT INTO public.gcoin_price_history (price, volume, timestamp, change_24h) 
SELECT 851, 25000, now() - interval '8 hours', 1.2
WHERE (SELECT COUNT(*) FROM public.gcoin_price_history) = 4;

INSERT INTO public.gcoin_price_history (price, volume, timestamp, change_24h) 
SELECT 853, 28000, now() - interval '4 hours', 1.8
WHERE (SELECT COUNT(*) FROM public.gcoin_price_history) = 5;

INSERT INTO public.gcoin_price_history (price, volume, timestamp, change_24h) 
SELECT 852, 24000, now() - interval '2 hours', 1.4
WHERE (SELECT COUNT(*) FROM public.gcoin_price_history) = 6;

INSERT INTO public.gcoin_price_history (price, volume, timestamp, change_24h) 
SELECT 853, 26000, now(), 1.8
WHERE (SELECT COUNT(*) FROM public.gcoin_price_history) = 7;

-- Function to add transaction to global feed
CREATE OR REPLACE FUNCTION add_to_global_feed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.global_transaction_feed (
    transaction_id,
    user_id,
    transaction_type,
    amount,
    wallet_address,
    timestamp
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.type,
    NEW.amount,
    CASE 
      WHEN NEW.type = 'send' THEN NEW.recipient
      WHEN NEW.type = 'receive' THEN NEW.sender
      ELSE (SELECT wallet_address FROM profiles WHERE id = NEW.user_id)
    END,
    NEW.timestamp
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS transaction_to_global_feed ON public.transactions;

-- Create trigger to automatically add transactions to global feed
CREATE TRIGGER transaction_to_global_feed
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION add_to_global_feed();

-- Function for admin to search users
CREATE OR REPLACE FUNCTION admin_search_user(search_term TEXT)
RETURNS TABLE(
  id UUID,
  username TEXT,
  email TEXT,
  wallet_address TEXT,
  balance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  last_ip INET
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.wallet_address,
    p.balance,
    p.created_at,
    ulh.login_time as last_login,
    ulh.ip_address as last_ip
  FROM profiles p
  LEFT JOIN (
    SELECT DISTINCT ON (user_id) 
      user_id, login_time, ip_address
    FROM user_login_history 
    WHERE status = 'success'
    ORDER BY user_id, login_time DESC
  ) ulh ON p.id = ulh.user_id
  WHERE 
    p.wallet_address ILIKE '%' || search_term || '%' OR
    p.username ILIKE '%' || search_term || '%' OR
    p.email ILIKE '%' || search_term || '%'
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
