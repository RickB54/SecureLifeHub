-- ==============================================================================
-- Health Hub & Doctor Visit Hub - Combined Re-Runnable Audit Migration
-- Safe to re-run: uses IF NOT EXISTS and DROP POLICY IF EXISTS before CREATE POLICY
-- ==============================================================================

-- 1. HEALTH PROFILE
CREATE TABLE IF NOT EXISTS public.health_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    allergies TEXT DEFAULT '',
    conditions TEXT DEFAULT '',
    insurance_provider TEXT DEFAULT '',
    insurance_id TEXT DEFAULT '',
    emergency_contact_name TEXT DEFAULT '',
    emergency_contact_phone TEXT DEFAULT '',
    emergency_contact_relation TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
ALTER TABLE public.health_profile ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT '';
ALTER TABLE public.health_profile ADD COLUMN IF NOT EXISTS conditions TEXT DEFAULT '';
ALTER TABLE public.health_profile ADD COLUMN IF NOT EXISTS insurance_provider TEXT DEFAULT '';
ALTER TABLE public.health_profile ADD COLUMN IF NOT EXISTS insurance_id TEXT DEFAULT '';
ALTER TABLE public.health_profile ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT DEFAULT '';
ALTER TABLE public.health_profile ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT DEFAULT '';
ALTER TABLE public.health_profile ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT DEFAULT '';
ALTER TABLE public.health_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own health profile" ON public.health_profile;
DROP POLICY IF EXISTS "Users can insert their own health profile" ON public.health_profile;
DROP POLICY IF EXISTS "Users can update their own health profile" ON public.health_profile;
DROP POLICY IF EXISTS "Users can delete their own health profile" ON public.health_profile;
CREATE POLICY "Users can view their own health profile" ON public.health_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health profile" ON public.health_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health profile" ON public.health_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own health profile" ON public.health_profile FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS health_profile_user_id_idx ON public.health_profile(user_id);

-- 2. HEALTH PREP ITEMS
CREATE TABLE IF NOT EXISTS public.health_prep_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.vault_items(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
ALTER TABLE public.health_prep_items ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES public.vault_items(id) ON DELETE CASCADE;
ALTER TABLE public.health_prep_items ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 NOT NULL;
ALTER TABLE public.health_prep_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own health prep items" ON public.health_prep_items;
DROP POLICY IF EXISTS "Users can insert their own health prep items" ON public.health_prep_items;
DROP POLICY IF EXISTS "Users can update their own health prep items" ON public.health_prep_items;
DROP POLICY IF EXISTS "Users can delete their own health prep items" ON public.health_prep_items;
CREATE POLICY "Users can view their own health prep items" ON public.health_prep_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health prep items" ON public.health_prep_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health prep items" ON public.health_prep_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own health prep items" ON public.health_prep_items FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS health_prep_items_user_id_idx ON public.health_prep_items(user_id);
CREATE INDEX IF NOT EXISTS health_prep_items_visit_id_idx ON public.health_prep_items(visit_id);

-- 3. HEALTH QUESTIONS
CREATE TABLE IF NOT EXISTS public.health_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answered BOOLEAN DEFAULT false NOT NULL,
    doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    doctor_name TEXT DEFAULT '',
    visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    answer_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
ALTER TABLE public.health_questions ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_questions ADD COLUMN IF NOT EXISTS doctor_name TEXT DEFAULT '';
ALTER TABLE public.health_questions ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_questions ADD COLUMN IF NOT EXISTS answer_notes TEXT DEFAULT '';
ALTER TABLE public.health_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own health questions" ON public.health_questions;
DROP POLICY IF EXISTS "Users can insert their own health questions" ON public.health_questions;
DROP POLICY IF EXISTS "Users can update their own health questions" ON public.health_questions;
DROP POLICY IF EXISTS "Users can delete their own health questions" ON public.health_questions;
CREATE POLICY "Users can view their own health questions" ON public.health_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health questions" ON public.health_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health questions" ON public.health_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own health questions" ON public.health_questions FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS health_questions_user_id_idx ON public.health_questions(user_id);
CREATE INDEX IF NOT EXISTS health_questions_doctor_id_idx ON public.health_questions(doctor_id);
CREATE INDEX IF NOT EXISTS health_questions_visit_id_idx ON public.health_questions(visit_id);

-- 4. HEALTH NOTES
CREATE TABLE IF NOT EXISTS public.health_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
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
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS date_type TEXT DEFAULT 'Other';
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS doctor_name TEXT DEFAULT '';
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS given_to_doctor BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS given_method TEXT;
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS given_date DATE;
ALTER TABLE public.health_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own health notes" ON public.health_notes;
DROP POLICY IF EXISTS "Users can insert their own health notes" ON public.health_notes;
DROP POLICY IF EXISTS "Users can update their own health notes" ON public.health_notes;
DROP POLICY IF EXISTS "Users can delete their own health notes" ON public.health_notes;
CREATE POLICY "Users can view their own health notes" ON public.health_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health notes" ON public.health_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health notes" ON public.health_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own health notes" ON public.health_notes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS health_notes_user_id_idx ON public.health_notes(user_id);
CREATE INDEX IF NOT EXISTS health_notes_doctor_id_idx ON public.health_notes(doctor_id);
CREATE INDEX IF NOT EXISTS health_notes_visit_id_idx ON public.health_notes(visit_id);

-- 5. HEALTH LETTERS
CREATE TABLE IF NOT EXISTS public.health_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    doctor_name TEXT DEFAULT '',
    visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    date_type TEXT DEFAULT 'Other',
    direction TEXT NOT NULL DEFAULT 'received' CHECK (direction IN ('sent', 'received')),
    status TEXT NOT NULL DEFAULT 'needed' CHECK (status IN ('needed', 'requested', 'received', 'sent')),
    notes TEXT DEFAULT '',
    attachment_url TEXT,
    attachment_name TEXT,
    given_to_doctor BOOLEAN DEFAULT false NOT NULL,
    given_method TEXT,
    given_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS date_type TEXT DEFAULT 'Other';
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS doctor_name TEXT DEFAULT '';
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS given_to_doctor BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS given_method TEXT;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS given_date DATE;
ALTER TABLE public.health_letters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own health letters" ON public.health_letters;
DROP POLICY IF EXISTS "Users can insert their own health letters" ON public.health_letters;
DROP POLICY IF EXISTS "Users can update their own health letters" ON public.health_letters;
DROP POLICY IF EXISTS "Users can delete their own health letters" ON public.health_letters;
CREATE POLICY "Users can view their own health letters" ON public.health_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health letters" ON public.health_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health letters" ON public.health_letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own health letters" ON public.health_letters FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS health_letters_user_id_idx ON public.health_letters(user_id);
CREATE INDEX IF NOT EXISTS health_letters_doctor_id_idx ON public.health_letters(doctor_id);
CREATE INDEX IF NOT EXISTS health_letters_visit_id_idx ON public.health_letters(visit_id);

-- 6. HEALTH REFERRALS
CREATE TABLE IF NOT EXISTS public.health_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    specialist_name TEXT NOT NULL,
    specialty TEXT DEFAULT '',
    doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    referred_by_doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    referred_by_name TEXT DEFAULT '',
    visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL,
    reason TEXT DEFAULT '',
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    date_type TEXT DEFAULT 'Other',
    status TEXT NOT NULL DEFAULT 'needed' CHECK (status IN ('needed', 'requested', 'scheduled', 'seen')),
    phone TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    given_to_doctor BOOLEAN DEFAULT false NOT NULL,
    given_method TEXT,
    given_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS date_type TEXT DEFAULT 'Other';
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS referred_by_doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS referred_by_name TEXT DEFAULT '';
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS given_to_doctor BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS given_method TEXT;
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS given_date DATE;
ALTER TABLE public.health_referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own health referrals" ON public.health_referrals;
DROP POLICY IF EXISTS "Users can insert their own health referrals" ON public.health_referrals;
DROP POLICY IF EXISTS "Users can update their own health referrals" ON public.health_referrals;
DROP POLICY IF EXISTS "Users can delete their own health referrals" ON public.health_referrals;
CREATE POLICY "Users can view their own health referrals" ON public.health_referrals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health referrals" ON public.health_referrals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health referrals" ON public.health_referrals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own health referrals" ON public.health_referrals FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS health_referrals_user_id_idx ON public.health_referrals(user_id);
CREATE INDEX IF NOT EXISTS health_referrals_doctor_id_idx ON public.health_referrals(doctor_id);
CREATE INDEX IF NOT EXISTS health_referrals_referred_by_doctor_id_idx ON public.health_referrals(referred_by_doctor_id);
CREATE INDEX IF NOT EXISTS health_referrals_visit_id_idx ON public.health_referrals(visit_id);

-- 7. HEALTH VISIT SUMMARIES
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
ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS date_type TEXT DEFAULT 'Other';
ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS doctor_name TEXT DEFAULT '';
ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS given_to_doctor BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS given_method TEXT;
ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS given_date DATE;
ALTER TABLE public.health_visit_summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own health visit summaries" ON public.health_visit_summaries;
DROP POLICY IF EXISTS "Users can insert their own health visit summaries" ON public.health_visit_summaries;
DROP POLICY IF EXISTS "Users can update their own health visit summaries" ON public.health_visit_summaries;
DROP POLICY IF EXISTS "Users can delete their own health visit summaries" ON public.health_visit_summaries;
CREATE POLICY "Users can view their own health visit summaries" ON public.health_visit_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health visit summaries" ON public.health_visit_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health visit summaries" ON public.health_visit_summaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own health visit summaries" ON public.health_visit_summaries FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS health_visit_summaries_user_id_idx ON public.health_visit_summaries(user_id);
CREATE INDEX IF NOT EXISTS health_visit_summaries_doctor_id_idx ON public.health_visit_summaries(doctor_id);
CREATE INDEX IF NOT EXISTS health_visit_summaries_visit_id_idx ON public.health_visit_summaries(visit_id);
CREATE INDEX IF NOT EXISTS health_visit_summaries_date_idx ON public.health_visit_summaries(date);

-- 8. VAULT_ITEMS INDEX FOR FAST HEALTH HUB QUERIES
CREATE INDEX IF NOT EXISTS vault_items_category_idx ON public.vault_items(category);
CREATE INDEX IF NOT EXISTS vault_items_user_category_idx ON public.vault_items(user_id, category);
