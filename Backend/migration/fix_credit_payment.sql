-- Fix credit_payment table to support customer_id payments

-- Add customer_id column if it doesn't exist
ALTER TABLE credit_payment ADD COLUMN IF NOT EXISTS customer_id BIGINT;

-- Add foreign key for customer_id
ALTER TABLE credit_payment ADD FOREIGN KEY IF NOT EXISTS (customer_id) REFERENCES credit_customer(id);

-- Make credit_entry_id nullable
ALTER TABLE credit_payment MODIFY COLUMN credit_entry_id BIGINT NULL;

-- Create index for customer_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_credit_payment_customer ON credit_payment(customer_id);