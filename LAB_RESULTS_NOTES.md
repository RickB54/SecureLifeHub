# Lab Results Feature — Architecture Plan & Decisions

> Contains architectural decisions only. Never store real patient data, names, DOBs, specimen IDs, or lab values in this file.

## 1. Existing Health Hub Integration Points Inspected
- **Navigation**: `components/health-records.tsx` manages all Health Hub tabs (`dashboard`, `records`, `meds`, `ai`, `vitals`, `labs` [NEW], `doctors`, `appointments`, `calendar`, `checkin`) for both mobile `<select>` and desktop tab bar, plus `normalizeHealthTab`.
- **Vitals & Styling**: Reuses `VitalsSparkline` (`components/health-ui/vitals-sparkline.tsx`), `VITAL_TONE_STYLES` (`lib/vitalsReference.ts`), `HealthTooltip` (`components/health-ui/health-tooltip.tsx`), `SmartSelect` (`components/health-ui/smart-select.tsx`), and dark card/badge styling matching `"Stage 2"` and `"BMI"` verdict badges.
- **Glucose Vital Card**: Vitals live in `vault_items` with `type: "note"`, `category: "Vitals"`, `title: "Glucose"`, `item_metadata: { is_vital: true, value, unit, date, context, notes, source }`. Confirmed lab glucose rows write into `vault_items` using `date_collected`, tagged `context: "Fasting"` (when `fasting === true`) and `source: "lab report"`, deduplicated on `(date, value, unit)`. A1c never writes to Glucose.
- **Timeline**: `health-records.tsx` Overview Timeline & Calendar view incorporate one event per lab report (`"Lab Results – <Lab>, <MM/DD/YYYY>"`) with flagged count at the real `date_collected`.
- **Overview Tab**: Adds a lightweight `Labs` stat tile + collapsible `Lab Results` overview accordion using a single lightweight query (latest report date + flagged count + recent report summary).
- **Dr. AI**: `components/health-ai.tsx` receives a compact `labSummaryContext` (flagged + recent results only) and answers lab-related questions directly using that compact context alongside its existing research lookup.
- **Doctor Visit Hub PDF / Print Export**: `components/doctor-visit-hub/DoctorVisitHub.tsx` and `DoctorVisitMode.tsx` fetch the latest lab report's compact summary, flagged results, and `"What to bring up with my doctor"` checklist and include them in Visit Mode, Copy as Text, and Print/PDF.

## 2. Architecture & Design Decisions
1. **Supabase Schema (`supabase/migrations/20261127_lab_results.sql`)**:
   - Tables: `lab_reports`, `lab_results`, `lab_test_aliases`, `lab_explanations`, `lab_drafts`.
   - All tables enforce Row Level Security (`user_id = auth.uid()`).
   - Indexes: `(user_id, normalized_test_key, date_collected)` and `(user_id, report_id)` on `lab_results`; `(user_id, date_collected DESC)` and partial unique `(user_id, specimen_id)` on `lab_reports`.
   - Private storage bucket `lab-reports` (`public = false`, 10 MB limit, per-user folder RLS). Signed URLs are 60-second TTL, fetched strictly on-demand when clicking `"View original"`.
2. **Gemini Edge Function + Server Route (`supabase/functions/lab-results-ai/index.ts` & `app/api/lab-results-ai/route.ts`)**:
   - Uses `gemini-2.5-flash` (vision-capable multimodal model supporting PNG/JPG/PDF/text) via `GEMINI_API_KEY` stored only in server/Edge Function secrets (never in `NEXT_PUBLIC_*`).
   - Frontend calls the Supabase Edge Function (`supabase.functions.invoke('lab-results-ai', ...)`) when deployed, with a Next.js server-side API route (`/api/lab-results-ai`) as fallback so the app works seamlessly in both Supabase-Edge-hosted and Next.js-server deployments without exposing any API key to the browser.
   - Strict JSON schema validation + post-extraction rule engine (`lib/lab-results-rules.ts`) enforces:
     - Lab printed range & flag are source of truth; mismatch -> `needs_review`.
     - Missing flag -> computed from range.
     - Edge-of-range unflagged value -> `is_borderline = true`, `flag_status = 'normal'` (informational only, NOT flagged).
     - Comparators (`<`, `>`) parsed into `comparator` + `value_numeric`.
     - `"Not Estab."` or blank range -> saved unflagged, NOT `needs_review`, NOT dropped.
     - Narrative/genetic tests (e.g. `"NO MUTATION IDENTIFIED"`) -> `is_narrative = true`, `value_numeric = null`, long text collapsed in `notes`.
     - Multi-calculation tests (e.g. two eGFR variants) -> kept as separate rows with shared `calculation_group`.
     - Low confidence / unreadable image -> returns `needs_retake` prompt instead of guessing.
     - Address & phone are explicitly stripped and never stored or logged.
3. **Egress Minimization**:
   - Images compressed client-side (`maxWidthOrHeight: 1600`, JPEG quality `0.7`). PDFs capped at `10 MB`.
   - Review screen previews files from `URL.createObjectURL` in browser memory — zero Storage reads during review.
   - Storing original file is an optional toggle (default ON). Deleting a report deletes its Storage file too.
   - Zero `select *`, paginated report history (10 per page), single lightweight trend query (`normalized_test_key, test_name, value_numeric, value_text, comparator, unit, flag_status, is_borderline, date_collected, source_kind`), client-side in-memory cache per page visit, no polling or realtime subscriptions.
   - Explanations cached per `(user_id, normalized_test_key)` in `lab_explanations` and fetched lazily only when expanding a row or panel.
4. **Hard Medical Safety Limits**:
   - Enforced both in the Gemini system prompt and via a deterministic safety sanitizer (`sanitizeLabExplanation`) that strips any directive phrasing about starting, stopping, or changing medication/supplement doses or diagnosing conditions.
   - Mandatory disclaimer shown in every explanation view: `"Educational information only, not a diagnosis. Discuss results with your doctor."`
   - High iron or ferritin always includes a reminder to ask the doctor before taking iron supplements or iron-fortified products.
   - Critical or far-out-of-range results state plainly to contact the doctor promptly rather than wait for the next visit.
5. **Ambiguous Choices Recorded**:
   - **Gemini API Tier**: Configured via `GEMINI_API_KEY` secret in Supabase Edge Functions (or server env). Users should provision a **Paid Tier** Google AI Studio / Vertex AI Gemini API key so uploaded lab reports are NOT used by Google for model training.
   - **Draft Persistence**: `lab_drafts` stores only small validated JSON (no base64/file bytes). When resuming a draft in a later session, the original local file preview is unavailable unless re-attached, while all extracted rows remain fully editable and confirmable.
   - **Duplicate Detection**: Enforced on `(user_id, specimen_id)` when `specimen_id` is present; falls back to `(user_id, lab_name, date_collected)` with an explicit warning and Skip / Overwrite choice.
   - **Previous-Result Column Import**: Imported as separate `lab_results` rows with `source_kind = 'previous_column'` and `date_collected = previous_date`, skipping any point where `(normalized_test_key, value_text/value_numeric, date_collected)` already exists. Direct report imports always supersede/deduplicate matching `previous_column` rows.
