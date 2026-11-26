"use client"

import jsPDF from "jspdf"
import { MedQaHistoryEntry, MED_QA_LABEL_DISCLAIMER, normalizeHistoryEntry } from "./medication-qa"

export const MED_QA_PDF_FOOTER = "Label wording from DailyMed. Not medical advice."

function formatEntryDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function buildMedQaPlainText(entries: MedQaHistoryEntry[]): string {
  return entries
    .map((e, idx) => {
      const header = [
        `#${idx + 1} — ${formatEntryDate(e.createdAt)} | For: ${e.forPerson}${e.drugs.length ? ` | Drugs: ${e.drugs.join(", ")}` : ""}`,
        `Question: ${e.question}`,
        `Summary: ${e.summaryVerdict}`,
      ]
      if (e.tags.length > 0) header.push(`Tags: ${e.tags.join(", ")}`)
      if (e.note.trim()) header.push(`Private Note: ${e.note.trim()}`)
      const secLines = e.sections.map(
        (s) => `\n[${s.heading}]${s.sourceLabel ? ` (${s.sourceLabel})` : ""}\n${s.body}`
      )
      const srcLines = e.sources.map((src) => `DailyMed Source (${src.labelTitle}): ${src.dailyMedUrl}`)
      return [...header, ...secLines, ...(srcLines.length ? ["", ...srcLines] : []), "", MED_QA_LABEL_DISCLAIMER].join("\n")
    })
    .join("\n\n------------------------------------------------------------\n\n")
}

export function downloadMedQaPdf(entries: MedQaHistoryEntry[]) {
  if (entries.length === 0) return
  const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 36
  const contentWidth = pageWidth - marginX * 2
  const topStart = 38
  const bottomLimit = pageHeight - 48

  const todayStr = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  let y = topStart

  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) {
      doc.addPage()
      y = topStart
    }
  }

  // Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(15, 23, 42)
  doc.text(`Medication Questions & DailyMed Answers — ${todayStr}`, marginX, y + 6)
  y += 22
  doc.setDrawColor(180, 185, 195)
  doc.setLineWidth(0.8)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 14

  entries.forEach((entry, idx) => {
    if (idx > 0) {
      ensureSpace(90)
      doc.setDrawColor(203, 213, 225)
      doc.line(marginX, y, pageWidth - marginX, y)
      y += 12
    }

    // Header box per Q&A entry
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    const qLines = doc.splitTextToSize(`Q: ${entry.question}`, contentWidth - 16) as string[]
    const metaLine = `Date: ${formatEntryDate(entry.createdAt)}   •   For: ${entry.forPerson}${
      entry.drugs.length > 0 ? `   •   Drugs: ${entry.drugs.join(", ")}` : ""
    }`
    const boxH = 18 + qLines.length * 14 + 12
    ensureSpace(boxH + 40)

    doc.setFillColor(241, 245, 249)
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(marginX, y, contentWidth, boxH, 4, 4, "FD")

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105)
    doc.text(metaLine, marginX + 8, y + 13)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text(qLines, marginX + 8, y + 28)
    y += boxH + 8

    // Summary
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9.5)
    doc.setTextColor(entry.verdictTone === "amber" || entry.verdictTone === "warning" ? 146 : 30, entry.verdictTone === "amber" || entry.verdictTone === "warning" ? 64 : 41, entry.verdictTone === "amber" || entry.verdictTone === "warning" ? 14 : 59)
    const sumLines = doc.splitTextToSize(entry.summaryVerdict, contentWidth) as string[]
    for (const line of sumLines) {
      ensureSpace(14)
      doc.text(line, marginX, y + 10)
      y += 13
    }
    y += 4

    // Private note & tags if present
    if (entry.note.trim()) {
      doc.setFont("helvetica", "italic")
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 81)
      const noteLines = doc.splitTextToSize(`Private note: ${entry.note.trim()}`, contentWidth) as string[]
      for (const line of noteLines) {
        ensureSpace(13)
        doc.text(line, marginX, y + 10)
        y += 12
      }
      y += 4
    }

    // Answer sections
    for (const sec of entry.sections) {
      ensureSpace(34)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9.5)
      doc.setTextColor(15, 23, 42)
      const hLines = doc.splitTextToSize(sec.heading, contentWidth) as string[]
      for (const hl of hLines) {
        ensureSpace(13)
        doc.text(hl, marginX, y + 10)
        y += 12
      }

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(31, 41, 55)
      const bodyClipped = sec.body.length > 2600 ? `${sec.body.slice(0, 2600)}… (see full DailyMed label)` : sec.body
      const bLines = doc.splitTextToSize(bodyClipped, contentWidth) as string[]
      for (const bl of bLines) {
        ensureSpace(12)
        doc.text(bl, marginX, y + 9)
        y += 11.5
      }
      y += 6
    }

    // DailyMed source links
    if (entry.sources.length > 0) {
      ensureSpace(24)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8.5)
      doc.setTextColor(37, 99, 235)
      for (const src of entry.sources) {
        ensureSpace(14)
        const srcText = `DailyMed (${src.labelTitle}): ${src.dailyMedUrl}`
        const sLines = doc.splitTextToSize(srcText, contentWidth) as string[]
        for (const sl of sLines) {
          ensureSpace(12)
          doc.text(sl, marginX, y + 9)
          y += 11
        }
      }
      y += 6
    }
  })

  // Footer & page numbers
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.5)
    doc.line(marginX, pageHeight - 34, pageWidth - marginX, pageHeight - 34)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(75, 85, 99)
    doc.text(MED_QA_PDF_FOOTER, marginX, pageHeight - 20)
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 20, { align: "right" })
  }

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  doc.save(`Medication_QA_Report_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.pdf`)
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>")
}

export function printMedQaEntries(entries: MedQaHistoryEntry[]) {
  if (entries.length === 0) return
  const printWin = window.open("", "_blank")
  if (!printWin) return

  const todayStr = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

  const itemsHtml = entries
    .map(
      (e) => `
      <article class="qa-card">
        <div class="qa-hdr">
          <div class="meta">Date: ${escapeHtml(formatEntryDate(e.createdAt))} &nbsp;&bull;&nbsp; For: <strong>${escapeHtml(e.forPerson)}</strong>${
        e.drugs.length ? ` &nbsp;&bull;&nbsp; Drugs: ${escapeHtml(e.drugs.join(", "))}` : ""
      }</div>
          <div class="q">Q: ${escapeHtml(e.question)}</div>
        </div>
        <div class="summary ${e.verdictTone === "amber" || e.verdictTone === "warning" ? "warn" : ""}">${escapeHtml(e.summaryVerdict)}</div>
        ${e.note.trim() ? `<div class="note"><strong>Private note:</strong> ${escapeHtml(e.note.trim())}</div>` : ""}
        ${e.sections
          .map(
            (s) => `<div class="sec">
              <div class="sec-h">${escapeHtml(s.heading)}${s.sourceLabel ? ` <span class="src-lbl">(${escapeHtml(s.sourceLabel)})</span>` : ""}</div>
              <div class="sec-b">${escapeHtml(s.body)}</div>
            </div>`
          )
          .join("")}
        ${
          e.sources.length
            ? `<div class="links"><strong>DailyMed Labels:</strong> ${e.sources
                .map((src) => `<a href="${escapeHtml(src.dailyMedUrl)}">${escapeHtml(src.labelTitle)} (${escapeHtml(src.dailyMedUrl)})</a>`)
                .join(" &nbsp;|&nbsp; ")}</div>`
            : ""
        }
      </article>`
    )
    .join("")

  printWin.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Medication Questions Report — ${escapeHtml(todayStr)}</title>
    <style>
      @page {
        size: letter portrait;
        margin: 0.5in 0.5in 0.65in 0.5in;
        @bottom-left { content: "${MED_QA_PDF_FOOTER}"; font-size: 8.5pt; color: #4b5563; }
        @bottom-right { content: "Page " counter(page) " of " counter(pages); font-size: 8.5pt; color: #4b5563; }
      }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 10pt; color: #111827; margin: 0; }
      h1 { font-size: 15pt; margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 1.5px solid #cbd5e1; }
      .qa-card { margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid #cbd5e1; }
      .qa-hdr { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; page-break-inside: avoid; }
      .meta { font-size: 8.5pt; color: #475569; margin-bottom: 3px; }
      .q { font-size: 11pt; font-weight: 700; color: #0f172a; }
      .summary { padding: 6px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #bfdbfe; font-weight: 600; margin-bottom: 8px; }
      .summary.warn { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
      .note { font-style: italic; font-size: 9.5pt; color: #374151; margin-bottom: 8px; }
      .sec { margin-bottom: 8px; }
      .sec-h { font-weight: 700; font-size: 9.5pt; color: #0f172a; margin-bottom: 2px; }
      .src-lbl { font-weight: 400; font-size: 8.5pt; color: #64748b; }
      .sec-b { font-size: 9pt; line-height: 1.45; color: #1f2937; }
      .links { font-size: 8.5pt; color: #1d4ed8; margin-top: 6px; word-break: break-all; }
      .footer { margin-top: 14px; padding-top: 6px; border-top: 1px solid #cbd5e1; font-size: 8.5pt; color: #4b5563; display: flex; justify-content: space-between; }
    </style>
  </head>
  <body>
    <h1>Medication Questions &amp; DailyMed Answers — ${escapeHtml(todayStr)}</h1>
    ${itemsHtml}
    <div class="footer">
      <span>${escapeHtml(MED_QA_PDF_FOOTER)}</span>
      <span>Prepared ${escapeHtml(todayStr)}</span>
    </div>
    <script>window.onload = function() { window.print(); };</script>
  </body>
</html>`)
  printWin.document.close()
}

export interface MedQaBackupBundle {
  version: 1
  exportedAt: string
  history: MedQaHistoryEntry[]
  lookupPills: string[]
  people: string[]
}

export function downloadMedQaBackupJson(bundle: MedQaBackupBundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  a.href = url
  a.download = `Medication_QA_History_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseMedQaBackupJson(rawText: string): {
  history: MedQaHistoryEntry[]
  lookupPills: string[]
  people: string[]
} {
  const parsed = JSON.parse(rawText)
  if (Array.isArray(parsed)) {
    return {
      history: parsed.map(normalizeHistoryEntry),
      lookupPills: [],
      people: [],
    }
  }
  const history = Array.isArray(parsed?.history) ? parsed.history.map(normalizeHistoryEntry) : []
  const lookupPills = Array.isArray(parsed?.lookupPills)
    ? parsed.lookupPills.map((s: any) => String(s || "").trim()).filter(Boolean)
    : []
  const people = Array.isArray(parsed?.people)
    ? parsed.people.map((s: any) => String(s || "").trim()).filter(Boolean)
    : []
  return { history, lookupPills, people }
}
