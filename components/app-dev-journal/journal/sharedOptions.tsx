import { createContext, useContext } from 'react';

export const sectionFields: Record<string, string> = { Platforms: 'platforms', 'AI Agents': 'aiAgents', 'AI Tools': 'aiTools', 'Cloud Services': 'cloudServices', 'Google Account': 'userNames', 'Google Keep': 'googleKeepAccounts' };
export interface OptionRegistry { added: Record<string, string[]>; deleted: Record<string, string[]> }
export const SharedOptionsContext = createContext<{
  options: (section: string, defaults: string[]) => string[];
  add: (section: string, value: string) => void;
  remove: (section: string, value: string) => void;
} | null>(null);
export const useSharedOptions = () => useContext(SharedOptionsContext);