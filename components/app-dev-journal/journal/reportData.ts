import type { Project } from './types';
import { formatDate, formatDateTime } from './dates';

export type ReportScope = 'summary' | 'all';
export interface ReportOptions { scope?: ReportScope; orientation?: 'portrait' | 'landscape'; title?: string; customFields?: { name: string; type: string }[] }
export const summaryHeaders = ['App Name', 'Platforms', 'AI Agents', 'Google Keep', 'Google Account', 'Last Request Date', 'Project Dir', 'Local Host', 'Published URL', 'Cloud Services'];
export function reportFields(project: Project, options: ReportOptions = {}): [string, string][] {
  const fields: [string, string][] = [
    ['App Name', project.appName], ['Platforms', project.platforms.join('; ')], ['AI Agents', project.aiAgents.join('; ')],
    ['Google Keep', (project.googleKeepAccounts || []).join(', ')], ['Google Account', project.userNames.join(', ')],
    ['Last Request Date', formatDate(project.currentRequestDate)], ['Project Dir', project.previewUrl],
    ['Local Host', project.localHost || ''], ['Published URL', project.publishedUrl], ['Cloud Services', project.cloudServices.join('; ')],
  ];
  if (options.scope !== 'all') return fields;
  fields.push(['AI Tools', project.aiTools.join('; ')], ['Initial Request Date', formatDate(project.initialRequestDate)],
    ['Last Good Restore Point', project.lastGoodRestorePoint], ['Current Restore Point', project.currentRestorePoint],
    ['General Notes', project.initialRequestNotes.content], ['Current Request Notes', project.currentRequestNotes.content],
    ['What Was Done', project.whatWasDone.content], ['What Needs Fixed', project.whatNeedsFixed.content],
    ['Is Favorite', project.isFavorite ? 'Yes' : 'No'], ['Is Deployed', project.isDeployed ? 'Yes' : 'No'],
    ['Deployed Date', formatDate(project.deployedDate)], ['Deployed From', project.deployedFrom], ['Published From', project.publishedFrom],
    ['Screenshots', (project.screenshots || []).join('\n')]);
  for (const field of options.customFields || []) {
    const value = (project as unknown as Record<string, unknown>)[field.name];
    fields.push([field.name, field.type === 'date' ? formatDate(String(value || '')) : Array.isArray(value) ? value.join('; ') : String(value ?? '')]);
  }
  return fields;
}
export function reportTitle(sortLabel?: string, filter = '', now = new Date()): string {
  return sortLabel ? `App Dev Journal - Sorted by ${sortLabel}${filter ? ` (${filter})` : ''} on ${formatDateTime(now)}` : 'App Dev Journal';
}