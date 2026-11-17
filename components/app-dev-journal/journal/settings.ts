import type { RecordSort } from './recordView';

export type ThemePreset = 'dark' | 'light' | 'oled' | 'cyberpunk';
export type FieldPlacement = 'afterDates' | 'afterTechnologies' | 'afterAccounts' | 'afterUrls' | 'customSection' | 'afterNotes';
export const placementLabels: Record<FieldPlacement, string> = {
  afterDates: 'After Request Dates', afterTechnologies: 'After Platforms / AI / Cloud', afterAccounts: 'After Google Account / Local Host',
  afterUrls: 'After Project Dir / Published URL', customSection: 'Custom Fields section (before Notes)', afterNotes: 'After Notes',
};
export interface CustomFieldDef { id: string; name: string; type: string; options?: string[]; placement?: FieldPlacement }

export interface JournalSettings {
  theme: ThemePreset; density: 'comfortable' | 'compact';
  defaultSort: RecordSort; defaultTab: 'projects' | 'todo' | 'ideas' | 'favorites' | 'hidden' | 'settings'; rememberLastRecord: boolean; showHiddenRecords: boolean;
  pdfOrientation: 'portrait' | 'landscape'; exportScope: 'summary' | 'all';
  autoSave: boolean; autoSaveDelay: number; confirmDelete: boolean;
}
export const defaultSettings: JournalSettings = {
  theme: 'dark', density: 'comfortable', defaultSort: 'platform', defaultTab: 'projects', rememberLastRecord: false, showHiddenRecords: false,
  pdfOrientation: 'portrait', exportScope: 'summary', autoSave: true, autoSaveDelay: 500, confirmDelete: true,
};
export const SETTINGS_KEY = 'journal-settings';
export function loadSettings(storage: Pick<Storage, 'getItem'> = localStorage): JournalSettings {
  try { return { ...defaultSettings, ...JSON.parse(storage.getItem(SETTINGS_KEY) || '{}') }; } catch { return defaultSettings; }
}
export function saveSettings(settings: JournalSettings) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

export function fieldsAt(fields: CustomFieldDef[], placement: FieldPlacement) {
  return fields.filter(field => (field.placement || 'customSection') === placement);
}
/** Renames a custom field's stored values in every record. */
export function renameFieldInRecords<T extends Record<string, unknown>>(records: T[], from: string, to: string): T[] {
  if (from === to) return records;
  return records.map(record => { const { [from]: value, ...rest } = record; return { ...rest, [to]: value } as T; });
}
export function removeFieldFromRecords<T extends Record<string, unknown>>(records: T[], name: string): T[] {
  return records.map(record => { const { [name]: _removed, ...rest } = record; return rest as T; });
}
