import { NextRequest, NextResponse } from "next/server"

const RESEND_API_URL = "https://api.resend.com/emails"
const DEFAULT_FROM = "Secure Life Hub <onboarding@resend.dev>"
const MAX_SCHEDULE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // Resend 30-day max

function escapeHtml(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY is not configured on the server." },
      { status: 500 }
    )
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM

  try {
    const body = await req.json()
    const action = body?.action as string

    // 1. Immediate test email
    if (action === "test") {
      const to = String(body?.to || "").trim()
      if (!to || !to.includes("@")) {
        return NextResponse.json(
          { ok: false, error: "Please enter a valid recipient email address." },
          { status: 400 }
        )
      }

      const res = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject: "Secure Life Hub - Test Appointment Reminder",
          text: [
            "This is a test email from Secure Life Hub.",
            "",
            "Your appointment email reminders are configured and working.",
            "",
            "Sent by Secure Life Hub",
          ].join("\n"),
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; line-height: 1.6;">
              <h2 style="margin: 0 0 12px;">Test Appointment Reminder</h2>
              <p>This is a test email confirming your appointment email reminders are working.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Sent by Secure Life Hub</p>
            </div>
          `,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return NextResponse.json(
          { ok: false, error: data?.message || data?.error || `Resend error (${res.status})` },
          { status: res.status }
        )
      }

      return NextResponse.json({ ok: true, resendId: data?.id || null })
    }

    // 2. Cancel one or more scheduled emails
    if (action === "cancel") {
      const resendIds: string[] = Array.isArray(body?.resendIds)
        ? body.resendIds.filter((id: any) => typeof id === "string" && id.trim().length > 0)
        : []

      const results: Array<{ id: string; cancelled: boolean }> = []
      for (const id of resendIds) {
        try {
          const res = await fetch(`${RESEND_API_URL}/${encodeURIComponent(id)}/cancel`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          })
          results.push({ id, cancelled: res.ok })
        } catch {
          results.push({ id, cancelled: false })
        }
      }

      return NextResponse.json({ ok: true, results })
    }

    // 2b. Check real delivery status of a scheduled email on-demand (manual tap only)
    if (action === "status") {
      const resendId = String(body?.resendId || "").trim()
      if (!resendId) {
        return NextResponse.json(
          { ok: false, error: "No Resend email ID saved for this reminder." },
          { status: 400 }
        )
      }

      const res = await fetch(`${RESEND_API_URL}/${encodeURIComponent(resendId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return NextResponse.json(
          { ok: false, error: data?.message || data?.error || `Resend error (${res.status})` },
          { status: res.status }
        )
      }

      const resendStatus = String(data?.last_event || data?.status || "unknown").toLowerCase()
      const failureReason =
        data?.failed?.reason ||
        data?.bounce?.message ||
        data?.error?.message ||
        (typeof data?.error === "string" ? data.error : null) ||
        null

      return NextResponse.json({
        ok: true,
        resendStatus,
        failureReason,
      })
    }

    // 3. Schedule a one-time appointment reminder email
    if (action === "schedule") {
      const to = String(body?.to || "").trim()
      const sendAtIso = String(body?.sendAtIso || "").trim()
      const reason = String(body?.reason || "Doctor Appointment").trim()
      const appointmentDateDisplay = String(body?.appointmentDateDisplay || "").trim()
      const doctor = String(body?.doctor || "").trim()
      const facility = String(body?.facility || "").trim()
      const address = String(body?.address || "").trim()

      if (!to || !to.includes("@")) {
        return NextResponse.json(
          { ok: false, error: "Valid recipient email address is required." },
          { status: 400 }
        )
      }

      const sendTs = new Date(sendAtIso).getTime()
      if (isNaN(sendTs)) {
        return NextResponse.json(
          { ok: false, error: "Invalid reminder send time." },
          { status: 400 }
        )
      }

      const now = Date.now()
      if (sendTs <= now + 30_000) {
        return NextResponse.json({
          ok: true,
          status: "skipped_past",
          resendId: null,
          sendAt: sendAtIso,
        })
      }

      if (sendTs - now > MAX_SCHEDULE_WINDOW_MS - 12 * 60 * 60 * 1000) {
        // Beyond Resend's 30-day scheduling limit — save as waiting
        return NextResponse.json({
          ok: true,
          status: "waiting",
          resendId: null,
          sendAt: sendAtIso,
        })
      }

      const subject = `Appointment reminder: ${reason}${appointmentDateDisplay ? ` - ${appointmentDateDisplay}` : ""}`

      const textLines = [
        `Reason: ${reason}`,
        appointmentDateDisplay ? `Date & Time: ${appointmentDateDisplay}` : null,
        doctor ? `Doctor: ${doctor}` : null,
        facility ? `Facility: ${facility}` : null,
        address ? `Address: ${address}` : null,
        "",
        "Sent by Secure Life Hub",
      ].filter((line): line is string => line !== null)

      const htmlRows = [
        `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Reason</td><td style="padding:4px 0;color:#111827;">${escapeHtml(reason)}</td></tr>`,
        appointmentDateDisplay
          ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Date &amp; Time</td><td style="padding:4px 0;color:#111827;">${escapeHtml(appointmentDateDisplay)}</td></tr>`
          : "",
        doctor
          ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Doctor</td><td style="padding:4px 0;color:#111827;">${escapeHtml(doctor)}</td></tr>`
          : "",
        facility
          ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Facility</td><td style="padding:4px 0;color:#111827;">${escapeHtml(facility)}</td></tr>`
          : "",
        address
          ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Address</td><td style="padding:4px 0;color:#111827;">${escapeHtml(address)}</td></tr>`
          : "",
      ]
        .filter(Boolean)
        .join("")

      const res = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          text: textLines.join("\n"),
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; line-height: 1.5;">
              <h2 style="margin: 0 0 12px; font-size: 18px;">Appointment Reminder</h2>
              <table style="border-collapse: collapse; font-size: 14px;">
                ${htmlRows}
              </table>
              <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Sent by Secure Life Hub</p>
            </div>
          `,
          scheduled_at: new Date(sendTs).toISOString(),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return NextResponse.json(
          { ok: false, error: data?.message || data?.error || `Resend error (${res.status})` },
          { status: res.status }
        )
      }

      return NextResponse.json({
        ok: true,
        status: "scheduled",
        resendId: data?.id || null,
        sendAt: new Date(sendTs).toISOString(),
      })
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process email reminder request" },
      { status: 500 }
    )
  }
}
