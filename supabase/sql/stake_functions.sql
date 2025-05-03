
-- Create staking_positions table to track staked GCoins
CREATE TABLE IF NOT EXISTS public.staking_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  estimated_reward NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staking_positions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own staking positions
CREATE POLICY "Users can view their own staking positions"
  ON public.staking_positions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create the stake_gcoin function
CREATE OR REPLACE FUNCTION public.stake_gcoin(amount NUMERIC, duration_days INTEGER)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id UUID;
  user_balance NUMERIC;
  estimated_reward NUMERIC;
  end_date TIMESTAMP WITH TIME ZONE;
  staking_id UUID;
BEGIN
  -- Get user ID (current user)
  user_id := auth.uid();

  -- Validate duration
  IF NOT (duration_days IN (1, 3, 7, 30)) THEN
    RAISE EXCEPTION 'Invalid staking duration. Allowed values: 1, 3, 7, 30 days';
  END IF;
  
  -- Calculate estimated reward (30% APR, prorated)
  estimated_reward := amount * (0.3 / 365) * duration_days;
  
  -- Calculate end date
  end_date := now() + (duration_days || ' days')::INTERVAL;
  
  -- Get user's balance
  SELECT balance INTO user_balance 
  FROM profiles 
  WHERE id = user_id;
  
  -- Check if user has enough balance
  IF user_balance < amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Generate staking ID
  staking_id := gen_random_uuid();
  
  -- Begin transaction
  BEGIN
    -- Update user's balance (deduct staked amount)
    UPDATE profiles 
    SET balance = balance - amount
    WHERE id = user_id;
    
    -- Create staking position
    INSERT INTO staking_positions (
      id,
      user_id,
      amount,
      duration_days,
      estimated_reward,
      start_date,
      end_date,
      status
    ) VALUES (
      staking_id,
      user_id,
      amount,
      duration_days,
      estimated_reward,
      now(),
      end_date,
      'active'
    );
    
    -- Record transaction for staking
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      fee,
      recipient,
      sender,
      status,
      description
    ) VALUES (
      user_id,
      'stake',
      amount,
      0,
      'Staking',
      'You',
      'completed',
      'Staked ' || amount || ' GCoins for ' || duration_days || ' days'
    );
    
    RETURN staking_id;
  END;
END;
$$;

-- Create the unstake_gcoin function
CREATE OR REPLACE FUNCTION public.unstake_gcoin(staking_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id UUID;
  staking_record RECORD;
  return_amount NUMERIC;
  penalty_amount NUMERIC;
  transaction_id UUID;
  is_early_unstake BOOLEAN;
BEGIN
  -- Get user ID (current user)
  user_id := auth.uid();
  
  -- Get staking record
  SELECT * INTO staking_record
  FROM staking_positions
  WHERE id = staking_id AND user_id = user_id AND status = 'active';
  
  IF staking_record IS NULL THEN
    RAISE EXCEPTION 'Staking position not found or already completed';
  END IF;
  
  -- Check if this is an early unstake
  is_early_unstake := now() < staking_record.end_date;
  
  -- Calculate return amount
  IF is_early_unstake THEN
    -- Early unstake: 10% penalty on principal
    penalty_amount := staking_record.amount * 0.1;
    return_amount := staking_record.amount - penalty_amount;
  ELSE
    -- Normal completion: full principal + reward
    return_amount := staking_record.amount + staking_record.estimated_reward;
    penalty_amount := 0;
  END IF;
  
  -- Generate transaction ID
  transaction_id := gen_random_uuid();
  
  -- Begin transaction
  BEGIN
    -- Update staking position status
    UPDATE staking_positions
    SET status = CASE WHEN is_early_unstake THEN 'canceled' ELSE 'completed' END
    WHERE id = staking_id;
    
    -- Return funds to user
    UPDATE profiles
    SET balance = balance + return_amount
    WHERE id = user_id;
    
    -- Record transaction
    INSERT INTO transactions (
      id,
      user_id,
      type,
      amount,
      fee,
      recipient,
      sender,
      status,
      description
    ) VALUES (
      transaction_id,
      user_id,
      'unstake',
      return_amount,
      penalty_amount,
      'You',
      'Staking',
      'completed',
      CASE
        WHEN is_early_unstake THEN 
          'Early unstake: ' || staking_record.amount || ' GCoins with ' || penalty_amount || ' GCoins penalty'
        ELSE
          'Completed stake: ' || staking_record.amount || ' GCoins with ' || staking_record.estimated_reward || ' GCoins reward'
      END
    );
    
    RETURN transaction_id;
  END;
END;
$$;

-- Create a function to process staking positions automatically
CREATE OR REPLACE FUNCTION process_completed_stakes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stake_record RECORD;
BEGIN
  -- Find completed stakes that are still marked as active
  FOR stake_record IN
    SELECT *
    FROM staking_positions
    WHERE status = 'active' AND end_date <= now()
  LOOP
    -- Call unstake function for each completed stake
    PERFORM public.unstake_gcoin(stake_record.id);
  END LOOP;
END;
$$;

-- Create a cron job to run every hour to check for completed stakes
SELECT cron.schedule('process-completed-stakes', '0 * * * *', 'SELECT process_completed_stakes()');

-- Create a function to update the send_money function to not charge fees for admin
CREATE OR REPLACE FUNCTION public.send_money(amount NUMERIC, recipient_wallet TEXT, note TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_id UUID;
  recipient_id UUID;
  sender_balance NUMERIC;
  transaction_fee NUMERIC;
  admin_wallet TEXT;
  is_admin BOOLEAN;
  sender_transaction_id UUID;
  recipient_transaction_id UUID;
BEGIN
  -- Get sender ID (current user)
  sender_id := auth.uid();
  
  -- Check if sender is an admin
  SELECT EXISTS (
    SELECT 1 FROM admin_accounts WHERE id = sender_id
  ) INTO is_admin;
  
  -- Calculate transaction fee based on if sender is admin and amount
  IF is_admin THEN
    transaction_fee := 0; -- No fee for admin
  ELSIF amount <= 50 THEN
    transaction_fee := amount * 0.01; -- 1% fee
  ELSIF amount <= 100 THEN
    transaction_fee := 5; -- 5 GCoins flat fee
  ELSE
    transaction_fee := amount * 0.05; -- 5% fee
  END IF;

  -- Get admin wallet address
  SELECT wallet_address INTO admin_wallet FROM admin_accounts LIMIT 1;

  -- Check if recipient exists
  SELECT id INTO recipient_id FROM profiles WHERE wallet_address = recipient_wallet;
  
  IF recipient_id IS NULL THEN
    RAISE EXCEPTION 'Recipient wallet address not found';
  END IF;
  
  -- Prevent sending to self
  IF recipient_id = sender_id THEN
    RAISE EXCEPTION 'Cannot send money to yourself';
  END IF;
  
  -- Check sender balance
  SELECT balance INTO sender_balance FROM profiles WHERE id = sender_id;
  
  IF sender_balance < (amount + transaction_fee) THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Generate transaction IDs
  sender_transaction_id := gen_random_uuid();
  recipient_transaction_id := gen_random_uuid();
  
  -- Begin transaction
  BEGIN
    -- Update sender balance (deduct amount + fee)
    UPDATE profiles 
    SET balance = balance - (amount + transaction_fee) 
    WHERE id = sender_id;
    
    -- Update recipient balance (add only the amount)
    UPDATE profiles 
    SET balance = balance + amount 
    WHERE id = recipient_id;

    -- Add transaction fee to admin wallet if fee exists
    IF transaction_fee > 0 THEN
      UPDATE profiles
      SET balance = balance + transaction_fee
      WHERE wallet_address = admin_wallet;
    END IF;
    
    -- Record sender transaction
    INSERT INTO transactions (
      id, 
      user_id, 
      type, 
      amount, 
      fee, 
      recipient, 
      sender, 
      status, 
      description, 
      related_transaction_id
    ) VALUES (
      sender_transaction_id,
      sender_id,
      'send',
      amount,
      transaction_fee,
      recipient_wallet,
      'You',
      'completed',
      note,
      recipient_transaction_id
    );
    
    -- Record recipient transaction
    INSERT INTO transactions (
      id, 
      user_id, 
      type, 
      amount, 
      fee, 
      recipient, 
      sender, 
      status, 
      description,
      related_transaction_id
    ) VALUES (
      recipient_transaction_id,
      recipient_id,
      'receive',
      amount,
      0,
      'You',
      (SELECT wallet_address FROM profiles WHERE id = sender_id),
      'completed',
      note,
      sender_transaction_id
    );
    
    RETURN sender_transaction_id;
  END;
END;
$$;

-- Create a function to create an admin account if it doesn't exist
CREATE OR REPLACE FUNCTION create_admin_account()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_email TEXT := 'admin@gcoin.com';
  admin_password TEXT := 'Admin@123'; -- You should change this!
  admin_id UUID;
  admin_wallet TEXT;
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    RETURN 'Admin account already exists';
  END IF;

  -- Create admin user
  INSERT INTO auth.users (
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    aud,
    role
  )
  VALUES (
    (SELECT instance_id FROM auth.instances LIMIT 1),
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO admin_id;

  -- Generate wallet address
  admin_wallet := 'gCoinAdmin' || substr(md5(random()::text), 0, 8);

  -- Create admin profile
  INSERT INTO profiles (
    id,
    email,
    username,
    wallet_address,
    balance
  )
  VALUES (
    admin_id,
    admin_email,
    'GCoin Admin',
    admin_wallet,
    1000000 -- Give admin initial balance
  );

  -- Add to admin_accounts table
  INSERT INTO admin_accounts (
    id,
    email,
    wallet_address
  )
  VALUES (
    admin_id,
    admin_email,
    admin_wallet
  );

  RETURN 'Admin account created with email: ' || admin_email || ' and password: ' || admin_password;
END;
$$;

-- Execute the function to create an admin account
SELECT create_admin_account();
