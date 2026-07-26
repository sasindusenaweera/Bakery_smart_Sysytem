-- Create credit_customer table
CREATE TABLE IF NOT EXISTS credit_customer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    address TEXT,
    total_credit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    remaining_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    reference_number VARCHAR(50) UNIQUE,
    created_by BIGINT,
    created_at DATETIME,
    updated_at DATETIME,
    last_transaction_date DATETIME,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create index for faster lookups
CREATE INDEX idx_credit_customer_phone ON credit_customer(phone_number);
CREATE INDEX idx_credit_customer_name ON credit_customer(customer_name);

-- Add customer_id to credit_transaction table
ALTER TABLE credit_transaction 
ADD COLUMN customer_id BIGINT,
ADD FOREIGN KEY (customer_id) REFERENCES credit_customer(id);

CREATE INDEX idx_credit_transaction_customer ON credit_transaction(customer_id);

-- Add customer_id to credit_payment table
ALTER TABLE credit_payment 
ADD COLUMN customer_id BIGINT,
ADD FOREIGN KEY (customer_id) REFERENCES credit_customer(id);

-- Make credit_entry_id nullable to support both credit_entry and credit_customer payments
ALTER TABLE credit_payment MODIFY COLUMN credit_entry_id BIGINT;

CREATE INDEX idx_credit_payment_customer ON credit_payment(customer_id);