-- Create Enum for Transaction Types
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Create Enum for Payment Methods
CREATE TYPE payment_method AS ENUM ('cash', 'mobile_money', 'bank_transfer', 'other');

-- Create Enum for Transaction Status
CREATE TYPE transaction_status AS ENUM ('paid', 'pending', 'overdue');

-- Financial Categories Table
CREATE TABLE IF NOT EXISTS financial_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type transaction_type NOT NULL,
    icon VARCHAR(50), -- Lucide icon identifier
    is_system BOOLEAN DEFAULT FALSE, -- To prevent users from deleting system-defined categories
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Categories
INSERT INTO financial_categories (name, type, icon, is_system) VALUES
-- Income Categories
('Crop Harvest Sales', 'income', 'sprout', true),
('Livestock Sales', 'income', 'beef', true),
('Equipment Rental', 'income', 'wrench', true),
('Government Grants', 'income', 'award', true),
('Other Income', 'income', 'circle-dollar-sign', true),
-- Expense Categories
('Seeds & Seedlings', 'expense', 'leaf', true),
('Animal Feed', 'expense', 'wheat', true),
('Fertilizer & Pesticides', 'expense', 'flask-conical', true),
('Veterinary & Medicine', 'expense', 'heart-pulse', true),
('Wages & Labor', 'expense', 'users', true),
('Fuel & Machinery Rent', 'expense', 'truck', true),
('Other Expense', 'expense', 'receipt', true);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method NOT NULL DEFAULT 'cash',
    status transaction_status NOT NULL DEFAULT 'paid',
    
    -- Optional associations for cost-allocations
    crop_cycle_id UUID, -- Will reference crop_cycles(id) when created
    herd_id UUID, -- Will reference herds(id) when created
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (All authenticated users can read system categories, create/read/update/delete their own custom categories)
CREATE POLICY "Allow public read of system categories" 
    ON financial_categories FOR SELECT 
    USING (is_system = true);

-- RLS Policies for Transactions
CREATE POLICY "Users can only read their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);
