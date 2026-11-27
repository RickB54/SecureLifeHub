// Supabase Edge Function: lab-results-ai
// Deploy with: supabase functions deploy lab-results-ai
// Secret required: supabase secrets set GEMINI_API_KEY=<your-paid-tier-gemini-key>
// PRIVACY: Never log file contents, extracted values, patient name, DOB, address, or phone.
// EGRESS: Returns ONLY small structured JSON — never echoes files or base64.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const GEMINI_MODEL = "gemini-2.5-flash"

const EXTRACTION_SYSTEM_PROMPT = `You are a medical lab report data extractor. You read ANY lab layout (LabCorp, Quest, hospital, clinic, PDF, image, screenshot, or pasted text).
CRITICAL RULES:
1. Ignore any surrounding screenshot chrome (browser tabs, Google Drive sidebar, scrollbars, OS taskbar).
2. NEVER output patient address, phone number, account number, or SSN.
3. Return STRICT JSON only matching this exact structure:
{
  "needs_retake": boolean,
  "retake_reason": string | null,
  "report": {
    "lab_name": string,
    "patient_name": string | null,
    "dob": string | null,
    "specimen_id": string | null,
    "ordering_physician": string | null,
    "date_collected": "YYYY-MM-DD" | null,
    "date_received": "YYYY-MM-DD" | null,
    "date_reported": "YYYY-MM-DD" | null,
    "fasting": boolean | null,
    "report_type": string | null,
    "extraction_confidence": "high" | "medium" | "low"
  },
  "results": [
    {
      "test_name": string,
      "panel_name": string,
      "value_numeric": number | null,
      "value_text": string,
      "comparator": "<" | ">" | null,
      "unit": string,
      "reference_low": number | null,
      "reference_high": number | null,
      "reference_text": string,
      "lab_flag": string | null,
      "previous_value": string | null,
      "previous_date": "YYYY-MM-DD" | null,
      "notes": string | null,
      "is_narrative": boolean
    }
  ]
}
4. NEVER guess unreadable values: set value_numeric=null, value_text="UNREADABLE", and if the image is blurry/unreadable set needs_retake=true and extraction_confidence="low".
5. Keep "<0.2" and ">59" as comparator + value_numeric (e.g. comparator="<", value_numeric=0.2, value_text="<0.2").
6. Keep multi-calculation tests (e.g. two eGFR variants) as separate result objects.
7. Keep tests with "Not Estab." or blank reference ranges (reference_low=null, reference_high=null, reference_text=""). Never drop them.
8. Keep tests missing a lab code or other column.
9. For narrative/genetic tests (e.g. "NO MUTATION IDENTIFIED" with long interpretation/methodology/references), set is_narrative=true, value_numeric=null, value_text="NO MUTATION IDENTIFIED", and put the full interpretation text in notes.
10. Attach comments printed under a test (e.g. A1c prediabetes/diabetes note) into that test's notes field.
11. Store units EXACTLY as printed; never convert units.`

const EXPLANATION_SYSTEM_PROMPT = `You explain lab results to a non-medical adult at about an 8th-grade reading level.
Short sentences. No jargon (if you use a medical term, define it in the same sentence). Friendly, calm, never alarming.
HARD SAFETY LIMITS:
- NEVER diagnose or name a condition as present.
- NEVER recommend starting, stopping, or changing any medication or supplement dose.
- NEVER prescribe a diet or treatment plan.
- Frame lifestyle/medication mentions as "commonly discussed with doctors" or "factors that can affect this", and "ask your doctor first".
- For high iron or ferritin, include a note to ask the doctor before taking iron supplements or iron-fortified products.
- For critical or far-out-of-range values, say plainly to contact the doctor promptly rather than wait for the next visit.
- For "needs_review" results, do not explain — say it needs checking first.
- Base everything ONLY on the provided saved results (and optional vitals). Never invent values or trends.
Return STRICT JSON:
{
  "summary_text": "4-6 plain-English sentences",
  "big_picture": {
    "whats_good": ["..."],
    "needs_attention": [{"system": "Liver", "tests": ["..."], "why_grouped": "...", "urgent": false}],
    "doctor_checklist": ["3-6 prioritized items"],
    "where_to_improve": ["short educational areas framed as ask your doctor first"]
  },
  "panel_overviews": {"Panel Name": "2-3 sentences"},
  "personalized_lines": {"normalized_test_key": "short personalized line with value, range, distance outside if flagged, and change from previous"},
  "generic_explanations": {
    "normalized_test_key": {
      "what_it_is": "1 sentence",
      "what_abnormal_means": "general possibilities, no diagnosis",
      "factors_discussed": "commonly discussed factors (flagged/borderline)",
      "doctor_questions": ["2-3 specific questions"]
    }
  }
}`

async function callGemini(apiKey: string, systemPrompt: string, parts: any[]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  })
  if (!res.ok) {
    throw new Error(`Gemini API request failed (${res.status})`)
  }
  const data = await res.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) throw new Error("Empty response from Gemini")
  const parsed = JSON.parse(rawText)
  return {
    parsed,
    token_usage: data?.usageMetadata
      ? {
          prompt_tokens: data.usageMetadata.promptTokenCount,
          candidates_tokens: data.usageMetadata.candidatesTokenCount,
          total_tokens: data.usageMetadata.totalTokenCount,
        }
      : null,
  }
}

// @ts-ignore Deno global in Supabase Edge Functions
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // @ts-ignore Deno global
    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY secret is not configured in Supabase Edge Function." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const body = await req.json()
    const action = body?.action

    if (action === "extract") {
      const parts: any[] = []
      const hints = body?.hints || {}
      parts.push({
        text: `Extract all lab results from this report. Optional hints (may be Auto-detect): Lab=${hints.labProvider || "Auto-detect"}, Type=${hints.reportType || "Auto-detect"}.`,
      })

      if (body?.fileBase64 && body?.mimeType) {
        parts.push({
          inline_data: {
            mime_type: String(body.mimeType),
            data: String(body.fileBase64),
          },
        })
      } else if (body?.pastedText) {
        parts.push({ text: String(body.pastedText) })
      } else {
        return new Response(
          JSON.stringify({ error: "Provide fileBase64 + mimeType or pastedText." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const { parsed, token_usage } = await callGemini(apiKey, EXTRACTION_SYSTEM_PROMPT, parts)
      return new Response(
        JSON.stringify({ ...parsed, token_usage, model: GEMINI_MODEL }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (action === "explain") {
      const compactInput = {
        report: body?.report,
        results: body?.results,
        missing_generic_keys: body?.missingTestKeys || [],
        vitals_context: body?.vitalsContext || null,
      }
      const { parsed, token_usage } = await callGemini(apiKey, EXPLANATION_SYSTEM_PROMPT, [
        { text: JSON.stringify(compactInput) },
      ])
      return new Response(
        JSON.stringify({ ...parsed, token_usage, model: GEMINI_MODEL }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Expected 'extract' or 'explain'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Lab AI processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
