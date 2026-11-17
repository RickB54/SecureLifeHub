import type { Project } from './types';
import { toIsoDate } from './dates';

export type RecordSort = 'platform' | 'appName' | 'updatedDate' | 'account' | 'creationDate' | 'aiAgents' | 'googleKeep' | 'cloudServices' | 'order';
export type SortDirection = 'asc' | 'desc';

export const recordSortLabels: Record<RecordSort, string> = {
  platform: 'Platform', appName: 'App Name', updatedDate: 'Updated Date', account: 'Google Account',
  creationDate: 'Creation Date', aiAgents: 'AI Agents', googleKeep: 'Google Keep', cloudServices: 'Cloud Services', order: 'Record Order',
};

export function recordValues(project: Project, sort: RecordSort): string[] {
  switch (sort) {
    case 'platform': return project.platforms.map(value => value.split(', ')[0] ?? '').filter(Boolean);
    case 'account': return project.userNames;
    case 'googleKeep': return project.googleKeepAccounts || [];
    case 'aiAgents': return project.aiAgents.map(value => value.split(', ')[0] ?? '').filter(Boolean);
    case 'cloudServices': return project.cloudServices.map(value => value.split(', ')[0] ?? '').filter(Boolean);
    case 'updatedDate': return [toIsoDate(project.currentRequestDate)].filter(Boolean);
    case 'creationDate': return [toIsoDate(project.initialRequestDate)].filter(Boolean);
    case 'appName': return [project.appName].filter(Boolean);
    case 'order': return [];
  }
}

export function recordFilterOptions(projects: Project[], sort: RecordSort): string[] {
  return [...new Set(projects.flatMap(project => recordValues(project, sort)))].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}

export function sortRecords(projects: Project[], sort: RecordSort = 'platform', direction: SortDirection = 'asc'): Project[] {
  if (sort === 'order') return [...projects];
  return [...projects].sort((a, b) => {
    const comparison = recordValues(a, sort).join('; ').localeCompare(recordValues(b, sort).join('; '), 'en', { sensitivity: 'base' }) || a.appName.localeCompare(b.appName);
    return direction === 'asc' ? comparison : -comparison;
  });
}

export function visibleRecords(projects: Project[], sort: RecordSort, value: string | string[] = '', search = '', direction: SortDirection = 'asc'): Project[] {
  const term = search.toLowerCase();
  const wanted = (Array.isArray(value) ? value : [value]).filter(Boolean);
  return sortRecords(projects.filter(project => {
    if (wanted.length && !recordValues(project, sort).some(item => wanted.includes(item))) return false;
    const searchable = [project.appName, ...project.platforms, ...project.aiAgents, ...project.userNames,
      ...project.cloudServices, ...(project.googleKeepAccounts || []), project.initialRequestNotes.content,
      project.currentRequestNotes.content, project.whatWasDone.content, project.whatNeedsFixed.content];
    return searchable.some(text => text.toLowerCase().includes(term));
  }), sort, direction);
}
export const FAVORITES_FILTER = '__favorites';
export const HIDDEN_FILTER = '__hidden';
export function journalRecords(projects: Project[], sort: RecordSort, selected: string[] = [], search = '', direction: SortDirection = 'asc', showHidden = false): Project[] {
  const values = selected.filter(value => value !== FAVORITES_FILTER && value !== HIDDEN_FILTER);
  const favorites = selected.includes(FAVORITES_FILTER), hidden = selected.includes(HIDDEN_FILTER);
  const hasSelection = selected.length > 0;
  return visibleRecords(projects.filter(project => {
    if (project.isHidden && !showHidden && !hidden) return false;
    return !hasSelection || (values.length > 0 && recordValues(project, sort).some(value => values.includes(value))) || (favorites && project.isFavorite) || (hidden && project.isHidden);
  }), sort, [], search, direction);
}
