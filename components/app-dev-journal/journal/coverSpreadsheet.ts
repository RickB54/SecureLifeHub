import ExcelJS from 'exceljs';
import type { Project } from './types';
import { toIsoDate } from './dates';
import { reportFields, summaryHeaders, type ReportOptions } from './reportData';
import { sortRecords, type RecordSort, type SortDirection } from './recordView';

export type SpreadsheetSort = RecordSort;
export const spreadsheetHeaders = summaryHeaders;

export function spreadsheetProjects(projects: Project[], sort: SpreadsheetSort = 'platform', direction: SortDirection = 'asc'): Project[] {
  return sortRecords(projects, sort, direction);
}

export async function createCoverSpreadsheet(projects: Project[], sort: SpreadsheetSort = 'platform', direction: SortDirection = 'asc', options: ReportOptions = {}): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'App Development Journal';
  const headers = projects[0] ? reportFields(projects[0], options).map(([label]) => label) : summaryHeaders;
  const widths = headers.map(label => label.includes('Dir') || label.includes('URL') ? 38 : 24);
  for (const orientation of ['landscape', 'portrait'] as const) {
    const sheet = workbook.addWorksheet(orientation === 'landscape' ? 'Landscape' : 'Portrait', {
      views: [{ state: 'frozen', ySplit: 1 }],
      // ExcelJS omits Letter from its enum; omitted paperSize is its documented Letter default.
      pageSetup: { orientation, fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:1', margins: { left: 0.25, right: 0.25, top: 0.6, bottom: 0.4, header: 0.2, footer: 0.2 } },
    });
    sheet.columns = headers.map((header, i) => ({ header, width: widths[i] ?? 18 }));
    const rows = spreadsheetProjects(projects, sort, direction).map(p => {
      return reportFields(p, options).map(([label, value]) => {
        const field = options.customFields?.find(field => field.name === label);
        const iso = label.endsWith('Date') || field?.type === 'date' ? toIsoDate(value) : '';
        return iso ? new Date(`${iso}T00:00:00Z`) : value;
      });
    });
    sheet.addTable({ name: orientation === 'landscape' ? 'LandscapeRecords' : 'PortraitRecords', ref: 'A1', headerRow: true, style: { theme: 'TableStyleMedium2', showRowStripes: true }, columns: headers.map(name => ({ name, filterButton: true })), rows });
    sheet.eachRow((row, index) => {
      row.font = { name: 'Arial', size: 11, bold: index === 1 };
      row.alignment = { vertical: 'top', wrapText: true };
      row.height = index === 1 ? 32 : Math.max(48, ...widths.map((width, i) => Math.ceil(row.getCell(i + 1).text.length / width) * 15 + 12));
      if (index > 1) row.eachCell(cell => { if (cell.value instanceof Date) cell.numFmt = 'mm-dd-yyyy'; });
    });
    sheet.pageSetup.printArea = `A1:${sheet.getColumn(headers.length).letter}${rows.length + 1}`;
    sheet.headerFooter.oddHeader = `&L${(options.title || 'App Dev Journal').replace(/&/g, '&&')}`;
    sheet.headerFooter.oddFooter = '&LApp Development Journal&RPage &P of &N';
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function deliverCoverSpreadsheet(blob: Blob) {
  const filename = 'journal-record-covers.xlsx';
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if ((error as DOMException).name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}