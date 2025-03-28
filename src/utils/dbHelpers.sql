
-- These SQL functions will need to be added to your Supabase project to bypass RLS

-- Function to insert a transaction with admin rights
CREATE OR REPLACE FUNCTION admin_insert_transaction(transaction_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with the privileges of the creator
AS $$
BEGIN
  INSERT INTO transactions (
    id, user_id, type, amount, fee, recipient, 
    sender, status, description, timestamp, related_transaction_id
  )
  VALUES (
    (transaction_data->>'id')::uuid,
    (transaction_data->>'user_id')::uuid,
    transaction_data->>'type',
    (transaction_data->>'amount')::numeric,
    (transaction_data->>'fee')::numeric,
    transaction_data->>'recipient',
    transaction_data->>'sender',
    transaction_data->>'status',
    transaction_data->>'description',
    (transaction_data->>'timestamp')::timestamp with time zone,
    (transaction_data->>'related_transaction_id')::uuid
  );
END;
$$;

-- Function to update a transaction with admin rights
CREATE OR REPLACE FUNCTION admin_update_transaction(
  p_transaction_id uuid,
  p_user_id uuid,
  p_updates jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE transactions
  SET
    status = COALESCE(p_updates->>'status', status),
    description = COALESCE(p_updates->>'description', description)
    -- Add other fields as needed
  WHERE id = p_transaction_id AND user_id = p_user_id;
END;
$$;

-- Function to update a user's balance with admin rights
CREATE OR REPLACE FUNCTION admin_update_balance(
  p_user_id uuid,
  p_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET balance = balance + p_amount
  WHERE id = p_user_id;
END;
$$;

-- Function to create a new profile with admin rights
CREATE OR REPLACE FUNCTION admin_create_profile(
  p_id uuid,
  p_wallet_address text,
  p_username text,
  p_email text,
  p_balance numeric DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (
    id, wallet_address, username, email, balance
  )
  VALUES (
    p_id, p_wallet_address, p_username, p_email, p_balance
  );
END;
$$;

-- Function to update exchange rates with admin rights
CREATE OR REPLACE FUNCTION admin_update_exchange_rate(
  p_currency text,
  p_rate numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_rate_id int;
BEGIN
  -- Check if rate exists
  SELECT id INTO existing_rate_id
  FROM exchange_rates
  WHERE currency = p_currency;
  
  IF existing_rate_id IS NULL THEN
    -- Insert new rate
    INSERT INTO exchange_rates (currency, rate)
    VALUES (p_currency, p_rate);
  ELSE
    -- Update existing rate
    UPDATE exchange_rates
    SET rate = p_rate, updated_at = now()
    WHERE currency = p_currency;
  END IF;
END;
$$;
