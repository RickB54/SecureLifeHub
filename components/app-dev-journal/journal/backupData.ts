import backup from './defaultBackup.json';
import type { Project } from './types';

export function sanitizeSpelling<T>(value: T): T {
  if (typeof value === 'string') return value.replace(/loveable/gi, 'Lovable') as T;
  if (Array.isArray(value)) return value.map(sanitizeSpelling) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key.replace(/loveable/gi, 'Lovable'), sanitizeSpelling(item)])) as T;
  return value;
}

export const BACKUP_VERSION_KEY = 'journal-backup-2026-11-16';

export function restoreStartingData(storage: Pick<Storage, 'getItem' | 'setItem'>) {
  const refresh = storage.getItem(BACKUP_VERSION_KEY) === null;
  for (const key of ['projects', 'ideas', 'todos', 'customFields'] as const) {
    const saved = refresh ? null : storage.getItem(key);
    const data = saved === null ? backup[key] : JSON.parse(saved);
    storage.setItem(key, JSON.stringify(sanitizeSpelling(data)));
  }
  if (refresh) storage.setItem('journal-shared-options', JSON.stringify(sanitizeSpelling(backup['journal-shared-options'])));
  if (refresh && backup['journal-settings']) storage.setItem('journal-settings', JSON.stringify(backup['journal-settings']));
  storage.setItem('journal-screenshot-nov-2026-imported', 'true');
  storage.setItem('journal-cover-corrections-v1', 'true');
  storage.setItem(BACKUP_VERSION_KEY, 'true');
  return JSON.parse(storage.getItem('projects') || '[]') as Project[];
}

export function withModification(previous: Project, next: Project, now = new Date().toISOString()): Project {
  const drafts = ['customPlatform', 'customAiAgent', 'customAiTools', 'customCloudService', 'customUserName', 'customGoogleKeepAccount'];
  const comparable = (p: Project) => Object.fromEntries(Object.entries(p).filter(([key, value]) => key !== 'modifiedAt' && !drafts.includes(key) && value !== undefined && !(Array.isArray(value) && value.length === 0) && value !== '').sort(([a], [b]) => a.localeCompare(b)));
  return JSON.stringify(comparable(previous)) === JSON.stringify(comparable(next)) ? previous : { ...next, modifiedAt: now };
}

export function removeSharedItem(projects: Project[], field: string, item: string, now = new Date().toISOString()): Project[] {
  return projects.map(project => {
    const values = (project as unknown as Record<string, unknown>)[field];
    if (!Array.isArray(values)) return project;
    return withModification(project, { ...project, [field]: values.filter(value => value !== item && !String(value).startsWith(`${item}, `)) }, now);
  });
}
export function clearJournalData(storage: Pick<Storage, 'setItem' | 'removeItem'>) {
  for (const key of ['projects', 'ideas', 'todos', 'customFields']) storage.setItem(key, '[]');
  storage.setItem('journal-shared-options', '{"added":{},"deleted":{}}');
  storage.removeItem('journal-last-record');
  storage.setItem(BACKUP_VERSION_KEY, 'true');
}

export function restoreJournalBackup(storage: Pick<Storage, 'setItem' | 'removeItem'>, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid backup');
  const data = input as Record<string, unknown>;
  const parsed = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? (() => { try { return JSON.parse(value); } catch { return value; } })() : value]));
  for (const key of ['projects', 'ideas', 'todos', 'customFields']) {
    if (!Array.isArray(parsed[key])) throw new Error('Missing collection: ' + key);
  }
  // Validate before touching saved data; do not remove unrelated browser storage.
  clearJournalData(storage);
  for (const [key, value] of Object.entries(parsed)) {
    if (['projects', 'ideas', 'todos', 'customFields', 'journal-shared-options', 'journal-settings', 'journal-last-record', 'securityPin'].includes(key))
      storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(sanitizeSpelling(value)));
  }
  storage.setItem(BACKUP_VERSION_KEY, 'true');
}
