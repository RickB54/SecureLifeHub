-- ==============================================================================
-- Lab Results Feature: Tables, Indexes, RLS Policies & Private Storage Bucket
-- Safe to re-run: IF NOT EXISTS + DROP POLICY IF EXISTS + ON CONFLICT DO UPDATE
-- ==============================================================================

-- 1. lab_reports
CREATE TABLE IF NOT EXISTS public.lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lab_name TEXT NOT NULL DEFAULT 'Unknown Lab',
    patient_name TEXT,
    dob TEXT,
    specimen_id TEXT,
    ordering_physician TEXT,
    date_collected DATE,
    date_received DATE,
    date_reported DATE,
    fasting BOOLEAN,
    report_type TEXT,
    source_file_path TEXT,
    source_file_mime TEXT,
    extraction_confidence TEXT NOT NULL DEFAULT 'medium',
    summary_text TEXT,
    big_picture_json JSONB,
    panel_overviews_json JSONB,
    flagged_count INTEGER NOT NULL DEFAULT 0,
    critical_count INTEGER NOT NULL DEFAULT 0,
    total_results_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique (user_id, specimen_id) when specimen_id is provided
CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_reports_user_specimen_unique
    ON public.lab_reports (user_id, specimen_id)
    WHERE specimen_id IS NOT NULL AND BTRIM(specimen_id) <> '';

CREATE INDEX IF NOT EXISTS idx_lab_reports_user_date
    ON public.lab_reports (user_id, date_collected DESC NULLS LAST, created_at DESC);

-- 2. lab_results
CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES public.lab_reports(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    normalized_test_key TEXT NOT NULL,
    panel_name TEXT NOT NULL DEFAULT 'General',
    value_numeric DOUBLE PRECISION,
    value_text TEXT NOT NULL DEFAULT '',
    comparator TEXT,
    unit TEXT NOT NULL DEFAULT '',
    reference_low DOUBLE PRECISION,
    reference_high DOUBLE PRECISION,
    reference_text TEXT NOT NULL DEFAULT '',
    lab_flag TEXT,
    flag_status TEXT NOT NULL DEFAULT 'normal',
    is_borderline BOOLEAN NOT NULL DEFAULT FALSE,
    previous_value TEXT,
    previous_date DATE,
    notes TEXT,
    is_narrative BOOLEAN NOT NULL DEFAULT FALSE,
    source_kind TEXT NOT NULL DEFAULT 'report',
    calculation_group TEXT,
    date_collected DATE,
    personalized_line TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Required composite indexes for lightweight trends and per-report fetches
CREATE INDEX IF NOT EXISTS idx_lab_results_user_test_date
    ON public.lab_results (user_id, normalized_test_key, date_collected);

CREATE INDEX IF NOT EXISTS idx_lab_results_user_report
    ON public.lab_results (user_id, report_id);

-- 3. lab_test_aliases (editable user test-name normalization map)
CREATE TABLE IF NOT EXISTS public.lab_test_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alias_name TEXT NOT NULL,
    normalized_test_key TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, alias_name)
);

-- 4. lab_explanations (cached generic plain-language explanations per test key)
CREATE TABLE IF NOT EXISTS public.lab_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    normalized_test_key TEXT NOT NULL,
    what_it_is TEXT NOT NULL,
    what_abnormal_means TEXT NOT NULL DEFAULT '',
    factors_discussed TEXT NOT NULL DEFAULT '',
    doctor_questions JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, normalized_test_key)
);

-- 5. lab_drafts (pending-review JSON drafts — never stores file bytes or base64)
CREATE TABLE IF NOT EXISTS public.lab_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL DEFAULT 'Pasted text',
    input_type TEXT NOT NULL DEFAULT 'image',
    status TEXT NOT NULL DEFAULT 'ready',
    extraction_confidence TEXT,
    needs_review_count INTEGER NOT NULL DEFAULT 0,
    date_collected DATE,
    draft_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_drafts_user_created
    ON public.lab_drafts (user_id, date_collected ASC NULLS LAST, created_at ASC);

-- ==============================================================================
-- Row Level Security (RLS) on every table
-- ==============================================================================

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_drafts ENABLE ROW LEVEL SECURITY;

-- lab_reports policies
DROP POLICY IF EXISTS "Users can manage own lab_reports" ON public.lab_reports;
CREATE POLICY "Users can manage own lab_reports"
    ON public.lab_reports FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- lab_results policies
DROP POLICY IF EXISTS "Users can manage own lab_results" ON public.lab_results;
CREATE POLICY "Users can manage own lab_results"
    ON public.lab_results FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- lab_test_aliases policies
DROP POLICY IF EXISTS "Users can manage own lab_test_aliases" ON public.lab_test_aliases;
CREATE POLICY "Users can manage own lab_test_aliases"
    ON public.lab_test_aliases FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- lab_explanations policies
DROP POLICY IF EXISTS "Users can manage own lab_explanations" ON public.lab_explanations;
CREATE POLICY "Users can manage own lab_explanations"
    ON public.lab_explanations FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- lab_drafts policies
DROP POLICY IF EXISTS "Users can manage own lab_drafts" ON public.lab_drafts;
CREATE POLICY "Users can manage own lab_drafts"
    ON public.lab_drafts FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- Private Storage Bucket: lab-reports (10 MB max, per-user folder RLS)
-- Path format: <user_id>/<report_id>.<ext>
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'lab-reports',
    'lab-reports',
    FALSE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = FALSE,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

DROP POLICY IF EXISTS "Users can view own lab reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own lab reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own lab reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own lab reports" ON storage.objects;

CREATE POLICY "Users can view own lab reports"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'lab-reports'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can upload own lab reports"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'lab-reports'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can update own lab reports"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'lab-reports'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can delete own lab reports"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'lab-reports'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
);
