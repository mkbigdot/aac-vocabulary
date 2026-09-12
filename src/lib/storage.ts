import type { Category, Settings, Word } from '../types';

const KEY = 'aac-vocabulary:v1';

export const defaultSettings: Settings = {
  voiceURI: null,
  rate: 0.95,
  pitch: 1,
  volume: 1,
  columns: 12,
  speakOnTap: true,
  autoGrammar: true,
  showLabels: true,
  highContrast: false,
  colorByPartOfSpeech: true,
};

export interface PersistedState {
  settings: Settings;
  /** Words added by the user, keyed by the category they belong to. */
  customWords: Record<string, Word[]>;
  /** Categories added by the user. */
  customCategories: Category[];
  /** Ids of built-in words the user has hidden. */
  hiddenWordIds: string[];
  /** Ids of the most recently used words, most recent first. */
  recentWordIds: string[];
}

export const emptyState: PersistedState = {
  settings: defaultSettings,
  customWords: {},
  customCategories: [],
  hiddenWordIds: [],
  recentWordIds: [],
};

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      settings: { ...defaultSettings, ...parsed.settings },
      customWords: parsed.customWords ?? {},
      customCategories: parsed.customCategories ?? [],
      hiddenWordIds: parsed.hiddenWordIds ?? [],
      recentWordIds: parsed.recentWordIds ?? [],
    };
  } catch {
    return emptyState;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private browsing; the board still works in memory.
  }
}

export function exportState(state: PersistedState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(json: string): PersistedState {
  const parsed = JSON.parse(json) as Partial<PersistedState>;
  return {
    settings: { ...defaultSettings, ...parsed.settings },
    customWords: parsed.customWords ?? {},
    customCategories: parsed.customCategories ?? [],
    hiddenWordIds: parsed.hiddenWordIds ?? [],
    recentWordIds: parsed.recentWordIds ?? [],
  };
}
