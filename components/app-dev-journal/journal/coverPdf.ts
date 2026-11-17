import { jsPDF } from 'jspdf';
import type { Project } from './types';
import { reportFields, type ReportOptions } from './reportData';

export function createCoverPdf(projects: Project[], options: ReportOptions = {}): Blob {
  const pdf = new jsPDF({ unit: 'mm', format: 'letter', orientation: options.orientation || 'portrait' });
  const width = pdf.internal.pageSize.getWidth(), bottom = pdf.internal.pageSize.getHeight() - 14;
  const columnWidth = (width - 36) / 2, right = width / 2 + 4;
  let y = 14;
  const header = () => {
    const full = options.title || 'App Dev Journal';
    const split = full.lastIndexOf(' on ');
    const main = split > 0 ? full.slice(0, split) : full, stamp = split > 0 ? full.slice(split + 1) : '';
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); pdf.setTextColor(29, 78, 216);
    const lines = pdf.splitTextToSize(main, width - 28) as string[];
    pdf.text(lines, 14, y); y += lines.length * 6.5;
    if (stamp) { pdf.setFont('helvetica', 'italic'); pdf.setFontSize(9); pdf.setTextColor(100, 116, 139); pdf.text(stamp, 14, y); y += 4.5; }
    pdf.setDrawColor(29, 78, 216); pdf.setLineWidth(0.6); pdf.line(14, y, width - 14, y);
    pdf.setDrawColor(0, 0, 0); pdf.setLineWidth(0.2); pdf.setTextColor(0, 0, 0); y += 7;
  };
  const newPage = () => { pdf.addPage(); y = 14; header(); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); };
  pdf.setProperties({ title: options.title || 'App Dev Journal' }); header();
  for (const project of projects) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
    const fields = reportFields(project, options);
    const pairs = Array.from({ length: 5 }, (_, index) => [fields[index], fields[index + 5]]);
    if (options.scope === 'all') for (let index = 10; index < fields.length; index += 2) pairs.push([fields[index], fields[index + 1]]);
    const rows = pairs.map(pair => pair.map(field => field ? pdf.splitTextToSize(`${field[0]}: ${field[1] || '—'}`, columnWidth) as string[] : []));
    const height = rows.reduce((sum, row) => sum + Math.max(...row.map(lines => lines.length)) * 4.4 + 3, 0) + 8;
    if (y + height > bottom && height < bottom - 35) newPage();
    for (const [rowIndex, row] of rows.entries()) {
      const pair = pairs[rowIndex] ?? [];
      const length = Math.max(...row.map(lines => lines.length));
      for (let line = 0; line < length; line++) {
        if (y + 5 > bottom) newPage();
        const leftLine = row[0]?.[line], rightLine = row[1]?.[line];
        const draw = (text: string | undefined, field: [string, string] | undefined, x: number) => {
          if (!text) return;
          const highlight = field?.[0] === 'App Name' ? [190, 18, 60] : field?.[0] === 'Platforms' ? [29, 78, 216] : null;
          pdf.setFont('helvetica', highlight ? 'bold' : 'normal'); pdf.setTextColor(...((highlight || [0, 0, 0]) as [number, number, number]));
          pdf.text(text, x, y);
        };
        draw(leftLine, pair[0], 14); draw(rightLine, pair[1], right);
        pdf.setFont('helvetica', 'normal'); pdf.setTextColor(0, 0, 0);
        y += 4.4;
      }
      y += 3;
    }
    pdf.line(14, y, width - 14, y); y += 8;
  }
  return pdf.output('blob');
}

export async function deliverCoverPdf(blob: Blob) {
  const filename = 'journal-record-covers.pdf';
  const file = new File([blob], filename, { type: 'application/pdf' });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if ((error as DOMException).name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}