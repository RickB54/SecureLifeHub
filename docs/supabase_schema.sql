-- ==========================================
-- SecureLifeHub - Supabase Database Schema
-- Professional Database Blueprint with Row-Level Security (RLS)
-- ==========================================

-- Enable the UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ==========================================

-- Create an automatic trigger function to update "updated_at" timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 2. FOLDERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS folders_user_id_idx ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON public.folders(parent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own folders" 
    ON public.folders FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders" 
    ON public.folders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
    ON public.folders FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
    ON public.folders FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE TRIGGER set_folders_updated_at
    BEFORE UPDATE ON public.folders
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ==========================================
-- 3. VAULT ITEMS TABLE (Passwords, Notes, Cards, Contacts)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.vault_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'password' NOT NULL,
    title TEXT NOT NULL,
    username TEXT,
    password TEXT,
    website TEXT,
    category TEXT,
    notes TEXT,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    is_favorite BOOLEAN DEFAULT false NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    item_metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS vault_items_user_id_idx ON public.vault_items(user_id);
CREATE INDEX IF NOT EXISTS vault_items_folder_id_idx ON public.vault_items(folder_id);
CREATE INDEX IF NOT EXISTS vault_items_type_idx ON public.vault_items(type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own vault items" 
    ON public.vault_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault items" 
    ON public.vault_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault items" 
    ON public.vault_items FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items" 
    ON public.vault_items FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE TRIGGER set_vault_items_updated_at
    BEFORE UPDATE ON public.vault_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ==========================================
-- 4. SECURE DATABASES TABLE (Dynamic Architectures / Blueprints)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.secure_databases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    fields JSONB DEFAULT '[]'::jsonb NOT NULL,
    color TEXT,
    display_settings JSONB,
    todo_settings JSONB,
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS secure_databases_user_id_idx ON public.secure_databases(user_id);
CREATE INDEX IF NOT EXISTS secure_databases_order_idx ON public.secure_databases(order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE public.secure_databases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own custom databases" 
    ON public.secure_databases FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom databases" 
    ON public.secure_databases FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom databases" 
    ON public.secure_databases FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom databases" 
    ON public.secure_databases FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE TRIGGER set_secure_databases_updated_at
    BEFORE UPDATE ON public.secure_databases
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ==========================================
-- 5. DATABASE RECORDS TABLE (Stored values and images for custom databases)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.database_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    database_id UUID NOT NULL REFERENCES public.secure_databases(id) ON DELETE CASCADE,
    values JSONB DEFAULT '{}'::jsonb NOT NULL,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_favorite BOOLEAN DEFAULT false NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS database_records_user_id_idx ON public.database_records(user_id);
CREATE INDEX IF NOT EXISTS database_records_db_id_idx ON public.database_records(database_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.database_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own database records" 
    ON public.database_records FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own database records" 
    ON public.database_records FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own database records" 
    ON public.database_records FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own database records" 
    ON public.database_records FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE TRIGGER set_database_records_updated_at
    BEFORE UPDATE ON public.database_records
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ==========================================
-- 6. DATABASE REPORTS TABLE (Custom saved reports/queries)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.database_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    database_title TEXT NOT NULL,
    name TEXT,
    description TEXT,
    query_config JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS database_reports_user_id_idx ON public.database_reports(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.database_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports" 
    ON public.database_reports FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" 
    ON public.database_reports FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
    ON public.database_reports FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
    ON public.database_reports FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE TRIGGER set_database_reports_updated_at
    BEFORE UPDATE ON public.database_reports
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ==========================================
-- SCHEMA SETUP COMPLETE
-- ==========================================
