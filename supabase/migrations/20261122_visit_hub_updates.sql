-- ==============================================================================
-- Doctor Visit Hub Updates
-- Adds date_type and given_to_doctor tracking to notes, letters, referrals
-- Creates health_visit_summaries table with RLS and user_id index
-- ==============================================================================

-- 1. Update health_notes
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS date_type TEXT DEFAULT 'Other';
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS given_to_doctor BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS given_method TEXT;
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS given_date DATE;

-- 2. Update health_letters
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS date_type TEXT DEFAULT 'Other';
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS given_to_doctor BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS given_method TEXT;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS given_date DATE;

-- 3. Update health_referrals
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS date_type TEXT DEFAULT 'Other';
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS given_to_doctor BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS given_method TEXT;
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS given_date DATE;

-- 4. Create health_visit_summaries table
CREATE TABLE IF NOT EXISTS public.health_visit_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    date_type TEXT DEFAULT 'Other',
    doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    doctor_name TEXT DEFAULT '',
    visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    given_to_doctor BOOLEAN DEFAULT false NOT NULL,
    given_method TEXT,
    given_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.health_visit_summaries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'health_visit_summaries' AND policyname = 'Users can view their own health visit summaries'
    ) THEN
        CREATE POLICY "Users can view their own health visit summaries" 
            ON public.health_visit_summaries FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'health_visit_summaries' AND policyname = 'Users can insert their own health visit summaries'
    ) THEN
        CREATE POLICY "Users can insert their own health visit summaries" 
            ON public.health_visit_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'health_visit_summaries' AND policyname = 'Users can update their own health visit summaries'
    ) THEN
        CREATE POLICY "Users can update their own health visit summaries" 
            ON public.health_visit_summaries FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'health_visit_summaries' AND policyname = 'Users can delete their own health visit summaries'
    ) THEN
        CREATE POLICY "Users can delete their own health visit summaries" 
            ON public.health_visit_summaries FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS health_visit_summaries_user_id_idx ON public.health_visit_summaries(user_id);
CREATE INDEX IF NOT EXISTS health_visit_summaries_doctor_id_idx ON public.health_visit_summaries(doctor_id);
CREATE INDEX IF NOT EXISTS health_visit_summaries_visit_id_idx ON public.health_visit_summaries(visit_id);
CREATE INDEX IF NOT EXISTS health_visit_summaries_date_idx ON public.health_visit_summaries(date);
