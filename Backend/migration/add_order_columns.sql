-- Migration script to add new columns to customer_order table
-- Run this SQL in your MySQL database (bakery_smart_db)
-- Compatible with MySQL 5.7+

-- Add columns if they don't exist
ALTER TABLE customer_order 
ADD COLUMN required_date DATETIME NULL 
AFTER order_date;

ALTER TABLE customer_order 
ADD COLUMN delivery_address TEXT NULL 
AFTER required_date;

ALTER TABLE customer_order 
ADD COLUMN preparation_notes TEXT NULL 
AFTER delivery_address;

ALTER TABLE customer_order 
ADD COLUMN advance_payment DECIMAL(10,2) DEFAULT 0.00 
AFTER preparation_notes;

ALTER TABLE customer_order 
ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0.00 
AFTER advance_payment;

ALTER TABLE customer_order 
ADD COLUMN created_by BIGINT NULL 
AFTER paid_amount;

-- Add foreign key for created_by (optional)
ALTER TABLE customer_order 
ADD CONSTRAINT fk_order_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Verify the changes
DESCRIBE customer_order;
