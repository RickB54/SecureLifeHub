-- ==============================================================================
-- Health Hub: Flexible Dropdowns & Optional Empty Dates (Re-runnable)
-- 1. Allow NULL (empty) dates on health_notes, health_letters, health_referrals, health_visit_summaries
-- 2. Remove CHECK constraints on health_letters.direction, health_letters.status, health_referrals.status
--    so custom dropdown values save cleanly without database rejection.
-- ==============================================================================

-- 1. Allow empty (NULL) dates
ALTER TABLE public.health_notes ALTER COLUMN date DROP NOT NULL, ALTER COLUMN date DROP DEFAULT;
ALTER TABLE public.health_letters ALTER COLUMN date DROP NOT NULL, ALTER COLUMN date DROP DEFAULT;
ALTER TABLE public.health_referrals ALTER COLUMN date DROP NOT NULL, ALTER COLUMN date DROP DEFAULT;
ALTER TABLE public.health_visit_summaries ALTER COLUMN date DROP NOT NULL, ALTER COLUMN date DROP DEFAULT;

-- 2. Remove CHECK constraints that block custom values
ALTER TABLE public.health_letters DROP CONSTRAINT IF EXISTS health_letters_direction_check;
ALTER TABLE public.health_letters DROP CONSTRAINT IF EXISTS health_letters_status_check;
ALTER TABLE public.health_referrals DROP CONSTRAINT IF EXISTS health_referrals_status_check;
