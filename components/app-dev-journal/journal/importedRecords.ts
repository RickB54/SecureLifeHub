import type { Project } from './types';

// Only columns represented by journal fields are transcribed; Notes and Paid $ are omitted.
const rows: [string, string, string, string[], string, string?][] = [
  ['Lovable', 'GymDayFitTracker', 'RB', ['xAI Grok, RB54'], '2025-03-21'],
  ['Lovable', 'SnapEatSmart', 'RAS', ['xAI Grok, RAS'], '2025-04-21'],
  ['Lovable', 'Pattern Play Runouts', 'RB54', ['ChatGPT, RB54'], '2025-02-11', 'RB54'],
  ['Lovable', 'CueTrack', '15D', [], '2025-02-14'],
  ['Lovable', '15 Diamonds', 'RB', [], '2025-02-10'],
  ['Lovable', 'Life Journal', 'RB54', ['ChatGPT, RB54'], '2025-02-18'],
  ['Lovable', 'Pocket Stats Pro', 'RAS', ['ChatGPT, RB54'], '2025-09-23'],
  ['Lovable', 'Prime Detail Pro', 'PDS', ['xAI Grok, PDS'], '', 'PDS'],
  ['v0.dev', 'CustomGymTracker', 'RAS', ['xAI Grok, RAS'], '2025-03-11'],
  ['v0.dev', 'Memory Match', 'RB', ['ChatGPT, RB'], '2025-04-07'],
  ['v0.dev', 'SecurePassHub', 'RB', ['xAI Grok, RB'], '2025-03-12'],
  ['v0.dev', 'Custom DB', '15D', ['xAI Grok, 15D'], '2025-02-23'],
  ['v0.dev', 'Pool Table Builder', 'RB54', ['xAI Grok, RB54'], '2025-02-24'],
  ['Bolt.new', 'Pattern Play Runouts', 'RB54', [], '2025-02-24'],
  ['Bolt.new', 'App Dev Journal', '15D', [], '2025-02-19'],
  ['Bolt.new', 'ToDo Scheduler', '?', ['Replit'], '2025-01-28'],
  ['Bolt.new', 'PowerMatrix', 'RB', ['xAI Grok, RB'], '2025-04-16'],
  ['Bolt.new', 'Billiards Point Tracker', '15D', ['xAI Grok', 'ChatGPT, 15D'], '2025-10-06', '15D'],
  ['Bolt.new', 'Prime Detail Solutions App', 'RAS', [], ''],
  ['CodePen', 'ScoreKeeper', '15D', ['ChatGPT', 'xAI Grok'], '2025-02-14'],
  ['CodePen', 'Score Card with Timer', 'RB54', ['xAI Grok'], '2025-02-24'],
  ['Google Studio', 'SmartCalorieScap', 'RB54', ['xAI Grok'], '2025-04-21'],
  ['Google Studio', 'PowerMatrix', 'RB54', ['xAI Grok'], '2025-04-15'],
  ['Tempo', 'PDS', 'PDS', ['xAI Grok, PDS'], '2025-10-29', 'PDS'],
  ['Tempo', 'Astrology Venture', 'RB', ['xAI Grok, RB'], '2025-04-25'],
  ['Trae', 'GDFT v2.0', 'Claude', [], '2025-06-13'],
];

export function screenshotRecords(): Project[] {
  return rows.map(([platform, appName, account, aiAgents, initialRequestDate, keep], order) => ({
    id: `screenshot-nov-2026-${order}`, appName, platforms: [platform], aiAgents,
    googleKeepAccounts: keep ? [keep] : [], aiTools: [], cloudServices: [], userNames: [account],
    initialRequestDate, currentRequestDate: '', lastGoodRestorePoint: '', currentRestorePoint: '',
    initialRequestNotes: { content: '', lastUpdated: '', isChecked: false },
    currentRequestNotes: { content: '', lastUpdated: '', isChecked: false },
    whatWasDone: { content: '', lastUpdated: '', isChecked: false },
    whatNeedsFixed: { content: '', lastUpdated: '', isChecked: false },
    previewUrl: '', publishedUrl: '', order, isFavorite: false, isDeployed: false,
    deployedDate: '', deployedFrom: '', publishedFrom: '',
  }));
}

export function mergeScreenshotRecords(existing: Project[]): Project[] {
  const added = screenshotRecords().filter(record => !existing.some(project =>
    project.id === record.id || (project.appName === record.appName && project.platforms.some(platform => record.platforms.includes(platform.split(', ')[0] || '')))));
  return [...existing, ...added.map((record, index) => ({ ...record, order: existing.length + index }))];
}

export function correctScreenshotRecords(existing: Project[]): Project[] {
  const reference = screenshotRecords();
  const journalRecords = existing.filter(p => /^(app dev journal|app development journal)$/i.test(p.appName));
  const currentJournal = journalRecords.find(p => p.platforms.some(platform => /^love?able/i.test(platform))) || journalRecords[0];
  return existing.filter(p => !journalRecords.includes(p) || p.id === currentJournal?.id).map(project => {
    const source = reference.find(p => p.id === project.id || (p.appName === project.appName && p.platforms.some(platform => project.platforms.some(value => value.split(', ')[0] === platform))));
    const updated = { ...project, userNames: project.userNames?.length ? project.userNames : source?.userNames || [] };
    if (project.id === currentJournal?.id) updated.platforms = ['Lovable'];
    if (project.appName === 'Pocket Stats Pro') {
      Object.assign(updated, { platforms: ['Lovable'], aiAgents: ['ChatGPT, RB54'], googleKeepAccounts: ['RB54'], userNames: ['RB54'], currentRequestDate: '2026-11-12', previewUrl: 'https://github.com/RickB54/pocket-stats-pro/pull/new/trae-update', publishedUrl: 'pocket-stats-pro.netlify.app' });
    }
    return updated;
  });
}