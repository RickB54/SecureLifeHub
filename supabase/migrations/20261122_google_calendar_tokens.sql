-- ==============================================================================
-- Google Calendar Integration Tokens - Supabase Database Migration
-- Stores server-side OAuth tokens with Row Level Security (RLS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_google_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at BIGINT NOT NULL, -- Unix timestamp in milliseconds
    scope TEXT,
    token_type TEXT DEFAULT 'Bearer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.user_google_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only manage their own tokens
CREATE POLICY "Users can select their own google tokens"
    ON public.user_google_tokens FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own google tokens"
    ON public.user_google_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own google tokens"
    ON public.user_google_tokens FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own google tokens"
    ON public.user_google_tokens FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_google_tokens_user_id_idx ON public.user_google_tokens(user_id);
