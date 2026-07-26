-- Credit Management Tables for Bakery Smart Management System

-- Credit Entry Table
CREATE TABLE IF NOT EXISTS credit_entry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    address VARCHAR(500),
    credit_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    remaining_balance DECIMAL(10,2) NOT NULL,
    due_date DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    notes TEXT,
    linked_order_id BIGINT,
    reference_number VARCHAR(50) UNIQUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_customer_name (customer_name),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- Credit Entry Items Table
CREATE TABLE IF NOT EXISTS credit_entry_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    credit_entry_id BIGINT NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (credit_entry_id) REFERENCES credit_entry(id) ON DELETE CASCADE
);

-- Credit Payments Table
CREATE TABLE IF NOT EXISTS credit_payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    credit_entry_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    reference_number VARCHAR(50) UNIQUE,
    payment_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (credit_entry_id) REFERENCES credit_entry(id) ON DELETE CASCADE
);
