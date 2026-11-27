import { NextRequest, NextResponse } from "next/server"
import {
  buildPlainLanguageExplanationsFallback,
  parseLabReportTextFallback,
  sanitizeExplanationText,
  validateAndNormalizeExtraction,
} from "@/lib/lab-results-rules"

export const runtime = "nodejs"

const GEMINI_MODEL = "gemini-2.5-flash"

const EXTRACTION_SYSTEM_PROMPT = `You are a medical lab report data extractor reading any lab layout (LabCorp, Quest, hospital, clinic, PDF, image, screenshot, or pasted text).
Ignore browser/Google Drive sidebars or surrounding screen elements. NEVER output address, phone, account number, or SSN.
Return STRICT JSON only:
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
Never guess unreadable values. Keep "<0.2" and ">59" as comparator + value_numeric. Keep multi-calculation tests (e.g. eGFR variants) separate. Keep "Not Estab." or blank-range tests unflagged and never drop them. Keep narrative/genetic tests (e.g. "NO MUTATION IDENTIFIED") with is_narrative=true and full interpretation in notes. Attach printed test comments to notes. Store units as printed.`

const EXPLANATION_SYSTEM_PROMPT = `You explain lab results to a non-medical adult at about an 8th-grade reading level. Short sentences, no jargon (define medical terms inline), friendly and calm.
HARD SAFETY LIMITS: Never diagnose, never name a condition as present, never tell the user to start/stop/change any medication or supplement dose, never prescribe a diet or treatment plan. Frame factors as "commonly discussed with doctors" and "ask your doctor first". For high iron or ferritin, note to ask the doctor before taking iron supplements or iron-fortified products. For critical or far-out-of-range values, say plainly to contact the doctor promptly rather than wait for the next visit. For needs_review rows, say it needs checking first. Base everything only on provided data.
Return STRICT JSON:
{
  "summary_text": string,
  "big_picture": {
    "whats_good": string[],
    "needs_attention": [{"system": string, "tests": string[], "why_grouped": string, "urgent": boolean}],
    "doctor_checklist": string[],
    "where_to_improve": string[]
  },
  "panel_overviews": Record<string, string>,
  "personalized_lines": Record<string, string>,
  "generic_explanations": Record<string, {"what_it_is": string, "what_abnormal_means": string, "factors_discussed": string, "doctor_questions": string[]}>
}`

async function callGeminiDirect(apiKey: string, systemPrompt: string, parts: any[]) {
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
    throw new Error(`Gemini request failed (${res.status})`)
  }
  const data = await res.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) throw new Error("Empty Gemini response")
  return {
    parsed: JSON.parse(rawText),
    token_usage: data?.usageMetadata
      ? {
          prompt_tokens: data.usageMetadata.promptTokenCount,
          candidates_tokens: data.usageMetadata.candidatesTokenCount,
          total_tokens: data.usageMetadata.totalTokenCount,
        }
      : null,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body?.action
    const userAliases = Array.isArray(body?.userAliases) ? body.userAliases : []

    // 1. Try Supabase Edge Function first if configured and auth header provided
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const authHeader = req.headers.get("authorization")
    if (supabaseUrl && authHeader && !body?.skipEdgeFunction) {
      try {
        const edgeRes = await fetch(`${supabaseUrl}/functions/v1/lab-results-ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(body),
        })
        if (edgeRes.ok) {
          const edgeJson = await edgeRes.json()
          if (action === "extract") {
            return NextResponse.json(validateAndNormalizeExtraction(edgeJson, userAliases))
          }
          return NextResponse.json(edgeJson)
        }
      } catch {
        // Fall through to server-side Gemini or deterministic fallback
      }
    }

    const geminiKey = process.env.GEMINI_API_KEY

    if (action === "extract") {
      if (geminiKey) {
        const parts: any[] = [
          {
            text: `Extract all lab results. Hints: Lab=${body?.hints?.labProvider || "Auto-detect"}, Type=${body?.hints?.reportType || "Auto-detect"}.`,
          },
        ]
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
          return NextResponse.json({ error: "Missing file or pasted text." }, { status: 400 })
        }

        const { parsed, token_usage } = await callGeminiDirect(geminiKey, EXTRACTION_SYSTEM_PROMPT, parts)
        return NextResponse.json(
          validateAndNormalizeExtraction({ ...parsed, token_usage }, userAliases)
        )
      }

      // If no GEMINI_API_KEY is configured yet:
      // - For pasted text, use our structured text parser fallback so text imports work immediately
      // - For image/PDF, return a clear actionable error explaining what is missing and what still works
      if (body?.pastedText) {
        const parsed = parseLabReportTextFallback(String(body.pastedText), body?.hints, userAliases)
        if (parsed.needs_retake) {
          return NextResponse.json({
            ...parsed,
            retake_reason:
              "Could not read any lab result rows from the pasted text (AI image/text reading is turned off until a Gemini key is added). Try pasting the table lines with test names, values, and ranges, or use Add Result Manually.",
          })
        }
        return NextResponse.json(parsed)
      }

      return NextResponse.json(
        {
          error:
            "Image and PDF scanning is turned off because no Gemini API key is configured. Paste Text and Add Result Manually both still work right now (including flags, trends, Glucose sync, and built-in plain-language explanations).",
        },
        { status: 503 }
      )
    }

    if (action === "explain") {
      const report = body?.report || { lab_name: "Lab", date_collected: null, fasting: null }
      const results = Array.isArray(body?.results) ? body.results : []
      const vitalsContext = body?.vitalsContext || undefined

      if (geminiKey) {
        try {
          const { parsed, token_usage } = await callGeminiDirect(geminiKey, EXPLANATION_SYSTEM_PROMPT, [
            {
              text: JSON.stringify({
                report,
                results,
                missing_generic_keys: body?.missingTestKeys || [],
                vitals_context: vitalsContext || null,
              }),
            },
          ])
          return NextResponse.json({
            summary_text: sanitizeExplanationText(parsed.summary_text || ""),
            big_picture: parsed.big_picture ? { ...parsed.big_picture, ai_fallback_used: false } : null,
            panel_overviews: parsed.panel_overviews || {},
            personalized_lines: parsed.personalized_lines || {},
            generic_explanations: parsed.generic_explanations || {},
            ai_fallback_used: false,
            token_usage,
          })
        } catch {
          // Fall back to deterministic plain-language generator so saving never blocks
        }
      }

      const fallback = buildPlainLanguageExplanationsFallback(report, results, vitalsContext)
      return NextResponse.json({
        ...fallback,
        big_picture: { ...fallback.big_picture, ai_fallback_used: true },
        ai_fallback_used: true,
        token_usage: null,
      })
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Lab AI route failed" },
      { status: 500 }
    )
  }
}
