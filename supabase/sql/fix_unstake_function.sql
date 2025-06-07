
-- Fix the unstake_gcoin function to resolve ambiguous column references
CREATE OR REPLACE FUNCTION public.unstake_gcoin(staking_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  staking_record RECORD;
  return_amount NUMERIC;
  penalty_amount NUMERIC;
  transaction_id UUID;
  is_early_unstake BOOLEAN;
BEGIN
  -- Get user ID (current user)
  current_user_id := auth.uid();
  
  -- Get staking record with explicit table prefixes
  SELECT sp.* INTO staking_record
  FROM staking_positions sp
  WHERE sp.id = staking_id AND sp.user_id = current_user_id AND sp.status = 'active';
  
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
    -- Update staking position status with explicit table prefix
    UPDATE staking_positions sp
    SET status = CASE WHEN is_early_unstake THEN 'canceled' ELSE 'completed' END
    WHERE sp.id = staking_id;
    
    -- Return funds to user with explicit table prefix
    UPDATE profiles p
    SET balance = p.balance + return_amount
    WHERE p.id = current_user_id;
    
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
      current_user_id,
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

-- Fix the add_mining_rewards function to ensure proper crediting
CREATE OR REPLACE FUNCTION public.add_mining_rewards(user_id_param uuid, amount_param numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user balance with explicit table prefix
  UPDATE profiles p 
  SET balance = p.balance + amount_param 
  WHERE p.id = user_id_param;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found or balance update failed';
  END IF;
END;
$$;

-- Fix the purchase_miner function to allow multiple purchases of the same miner
CREATE OR REPLACE FUNCTION public.purchase_miner(miner_id_param text, price_param numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_val UUID;
  user_balance_val NUMERIC;
BEGIN
  -- Get current user ID
  user_id_val := auth.uid();
  
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get user balance with explicit table prefix
  SELECT p.balance INTO user_balance_val 
  FROM profiles p 
  WHERE p.id = user_id_val;
  
  -- Check if user has enough balance
  IF user_balance_val < price_param THEN
    RAISE EXCEPTION 'Insufficient balance to purchase miner';
  END IF;
  
  -- Deduct price from user balance with explicit table prefix
  UPDATE profiles p 
  SET balance = p.balance - price_param 
  WHERE p.id = user_id_val;
  
  -- Add miner to user's collection (allow multiple of same type)
  INSERT INTO user_miners (user_id, miner_id) 
  VALUES (user_id_val, miner_id_param);
END;
$$;
