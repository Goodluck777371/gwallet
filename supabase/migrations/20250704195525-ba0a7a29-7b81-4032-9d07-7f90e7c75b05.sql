-- First check if NGN rate exists, if not insert it  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM exchange_rates WHERE currency = 'NGN') THEN
    INSERT INTO exchange_rates (currency, rate) VALUES ('NGN', 850);
  ELSE
    UPDATE exchange_rates SET rate = 850, updated_at = now() WHERE currency = 'NGN';
  END IF;
END $$;

-- Create receipts table for payment confirmations
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID,
  payment_reference TEXT NOT NULL,
  amount_naira NUMERIC NOT NULL,
  gcoin_amount NUMERIC NOT NULL,
  fee_gcoin NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'paystack',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on receipts table
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own receipts
CREATE POLICY "Users can view their own receipts" 
ON public.payment_receipts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Function to create payment receipt
CREATE OR REPLACE FUNCTION public.create_payment_receipt(
  p_payment_reference TEXT,
  p_amount_naira NUMERIC,
  p_gcoin_amount NUMERIC,
  p_fee_gcoin NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_val UUID;
  receipt_id UUID;
  transaction_id_val UUID;
BEGIN
  user_id_val := auth.uid();
  
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get the latest buy transaction for this user
  SELECT id INTO transaction_id_val
  FROM transactions 
  WHERE user_id = user_id_val 
    AND type = 'buy'
    AND status = 'completed'
  ORDER BY timestamp DESC
  LIMIT 1;
  
  -- Create receipt
  INSERT INTO payment_receipts (
    user_id, 
    transaction_id, 
    payment_reference, 
    amount_naira, 
    gcoin_amount, 
    fee_gcoin
  ) VALUES (
    user_id_val,
    transaction_id_val,
    p_payment_reference,
    p_amount_naira,
    p_gcoin_amount,
    p_fee_gcoin
  ) RETURNING id INTO receipt_id;
  
  RETURN receipt_id;
END;
$$;