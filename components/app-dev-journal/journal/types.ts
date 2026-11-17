// @ts-nocheck
export interface Note {
  content: string;
  lastUpdated: string;
  isChecked: boolean;
}

export interface Project {
  modifiedAt?: string;
  isHidden?: boolean;
  id: string;
  appName: string;
  platforms: string[];
  aiAgents: string[];
  googleKeepAccounts?: string[];
  customGoogleKeepAccount?: string;
  aiTools: string[];
  cloudServices: string[];
  userNames: string[];
  initialRequestDate: string;
  currentRequestDate: string;
  lastGoodRestorePoint: string;
  currentRestorePoint: string;
  initialRequestNotes: Note;
  currentRequestNotes: Note;
  whatWasDone: Note;
  whatNeedsFixed: Note;
  previewUrl: string;
  publishedUrl: string;
  localHost?: string;
  customPlatform?: string;
  customAiAgent?: string;
  customAiTools?: string;
  customCloudService?: string;
  customUserName?: string;
  order: number;
  isFavorite: boolean;
  screenshots?: string[];
  isDeployed: boolean;
  deployedDate: string;
  deployedFrom: string;
  publishedFrom: string;
}

export interface AppIdea {
  id: string;
  content: string;
  dateCreated: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Category = 'bug' | 'feature' | 'improvement' | 'documentation' | 'work' | 'personal' | 'other';

export interface TodoItem {
  id: string;
  content: string;
  projectId: string;
  projectName: string;
  noteType: string;
  dateCreated: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: string;
  dueTime?: string;
  notes?: string;
  assignedTo?: string;
  tags: string[];
  linkedNotes?: Note[];
}

export const defaultPlatforms = [
  'Lovable',
  'Bolt.diy',
  'Bolt.new',
  'CodePen',
  'Cursor',
  'Windsurf',
  'Replit',
  'GitHub Codespaces',
  'v0.dev',
  'Trae',
  'Antigravity',
  'N8N',
  'Tempo'
];

export const defaultAiAgents = [
  'xAI Grok',
  'ChatGPT',
  'Claude',
  'Google Gemini (Bard)'
];

export const defaultAiTools = [
  'GitHub',
  'Bitbucket'
];

export const defaultCloudServices = [
  'Supabase',
  'Google Cloud',
  'Netlify',
  'Vercel'
];

export const defaultAccounts = [
  'RB',
  'RB54',
  '15D',
  'PDS',
  'RAS',
  'PAD',
  'RJB',
  'RetroRick'
];

export const defaultUserNames = [...defaultAccounts];