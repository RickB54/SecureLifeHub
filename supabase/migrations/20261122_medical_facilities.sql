-- ==============================================================================
-- Medical Facilities & facility_id Links Across Health Hub Tables
-- Safe to re-run: IF NOT EXISTS + DROP POLICY IF EXISTS before CREATE POLICY
-- Note: Medical Facilities themselves are stored in public.vault_items
-- (category = 'Medical Facilities', item_metadata.is_facility = true),
-- which already has per-user RLS enabled.
-- ==============================================================================

-- 1. Add nullable facility_id and facility_name to all Doctor Visit Hub tables
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_notes ADD COLUMN IF NOT EXISTS facility_name TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS health_notes_facility_id_idx ON public.health_notes(facility_id);

ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_letters ADD COLUMN IF NOT EXISTS facility_name TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS health_letters_facility_id_idx ON public.health_letters(facility_id);

ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_referrals ADD COLUMN IF NOT EXISTS facility_name TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS health_referrals_facility_id_idx ON public.health_referrals(facility_id);

ALTER TABLE public.health_questions ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_questions ADD COLUMN IF NOT EXISTS facility_name TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS health_questions_facility_id_idx ON public.health_questions(facility_id);

ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.vault_items(id) ON DELETE SET NULL;
ALTER TABLE public.health_visit_summaries ADD COLUMN IF NOT EXISTS facility_name TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS health_visit_summaries_facility_id_idx ON public.health_visit_summaries(facility_id);

-- 2. Ensure per-user RLS on vault_items (stores Medical Facilities, Doctors, Visits, Meds, Vitals)
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own vault items" ON public.vault_items;
DROP POLICY IF EXISTS "Users can insert their own vault items" ON public.vault_items;
DROP POLICY IF EXISTS "Users can update their own vault items" ON public.vault_items;
DROP POLICY IF EXISTS "Users can delete their own vault items" ON public.vault_items;
CREATE POLICY "Users can view their own vault items" ON public.vault_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vault items" ON public.vault_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vault items" ON public.vault_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vault items" ON public.vault_items FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS vault_items_user_category_idx ON public.vault_items(user_id, category);
