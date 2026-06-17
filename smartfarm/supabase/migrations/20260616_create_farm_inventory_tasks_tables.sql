-- Create Enum for Field Status
CREATE TYPE field_status AS ENUM ('healthy', 'attention', 'critical');

-- Create Enum for Livestock Status
CREATE TYPE livestock_status AS ENUM ('healthy', 'sick', 'quarantine');

-- Create Enum for Task Status
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'done');

-- Fields / Crops Table
CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    crop VARCHAR(255),
    area VARCHAR(50),
    workers INTEGER DEFAULT 0,
    status field_status NOT NULL DEFAULT 'healthy',
    moisture INTEGER DEFAULT 50 CHECK (moisture >= 0 AND moisture <= 100),
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Livestock Table
CREATE TABLE IF NOT EXISTS livestock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g. "Flock A", "Dairy Cows"
    type VARCHAR(100) NOT NULL, -- e.g. "Poultry", "Cattle", "Goats", "Pigs"
    count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
    status livestock_status NOT NULL DEFAULT 'healthy',
    feed VARCHAR(255), -- Feed type/requirements
    health_check DATE NOT NULL DEFAULT CURRENT_DATE, -- Last health check
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Seeds, Feed, Fertilizer, Medicine, Other
    qty NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (qty >= 0),
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    low_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assignee VARCHAR(255) DEFAULT 'Unassigned',
    due_date DATE,
    status task_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Fields
CREATE POLICY "Users can only read their own fields" ON fields FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own fields" ON fields FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own fields" ON fields FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own fields" ON fields FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Livestock
CREATE POLICY "Users can only read their own livestock" ON livestock FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own livestock" ON livestock FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own livestock" ON livestock FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own livestock" ON livestock FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Inventory
CREATE POLICY "Users can only read their own inventory" ON inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own inventory" ON inventory FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own inventory" ON inventory FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Tasks
CREATE POLICY "Users can only read their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);
