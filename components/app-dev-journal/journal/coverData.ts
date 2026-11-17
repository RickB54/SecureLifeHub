import type { Project } from './types';
import { reportFields } from './reportData';

export function coverFields(project: Project): [string, string][] {
  return reportFields(project).slice(1);
}