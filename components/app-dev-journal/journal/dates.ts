export function toIsoDate(value: string): string {
  if (!value) return '';
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  const us = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:$|,|\s)/);
  const parts = iso ? [iso[1], iso[2], iso[3]] : us ? [us[3], us[1]?.padStart(2, '0'), us[2]?.padStart(2, '0')] : null;
  if (!parts) return '';
  const [year, month, day] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)
    ? `${year}-${month}-${day}` : '';
}

export function formatDate(value?: string | Date): string {
  if (!value) return '';
  const iso = typeof value === 'string' ? toIsoDate(value) : '';
  if (iso) return `${iso.slice(5, 7)}-${iso.slice(8, 10)}-${iso.slice(0, 4)}`;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
}

export function formatDateTime(value?: string | Date): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return `${formatDate(value)}${Number.isNaN(date.getTime()) ? '' : `, ${date.toLocaleTimeString('en-US')}`}`;
}