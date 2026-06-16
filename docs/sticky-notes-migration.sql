-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sticky_notebooks table
CREATE TABLE IF NOT EXISTS sticky_notebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for sticky_notebooks
ALTER TABLE sticky_notebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notebooks" 
ON sticky_notebooks 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create sticky_sections table
CREATE TABLE IF NOT EXISTS sticky_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notebook_id UUID NOT NULL REFERENCES sticky_notebooks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for sticky_sections
ALTER TABLE sticky_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sections" 
ON sticky_sections 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create sticky_notes table
CREATE TABLE IF NOT EXISTS sticky_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sticky_sections(id) ON DELETE SET NULL,
    title TEXT DEFAULT '' NOT NULL,
    content TEXT DEFAULT '' NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    is_pinned BOOLEAN DEFAULT false NOT NULL,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    versions JSONB DEFAULT '[]'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for sticky_notes
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes" 
ON sticky_notes 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create trigger/function to automatically update updated_at on sticky_notes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_sticky_notes_updated_at
    BEFORE UPDATE ON sticky_notes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
