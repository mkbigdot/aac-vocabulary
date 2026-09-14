import type { Category, Settings, Word } from '../types';

const LEGACY_KEY = 'aac-vocabulary:v1';
const ACCOUNT_INDEX_KEY = 'aac-vocabulary:accounts:v1';
const ACTIVE_ACCOUNT_KEY = 'aac-vocabulary:active-account:v1';
const DEFAULT_ACCOUNT_ID = 'default';

const accountStateKey = (accountId: string) => `aac-vocabulary:account:${accountId}:v1`;

export interface LocalAccount {
  id: string;
  name: string;
}

export const defaultSettings: Settings = {
  childName: 'Karthik',
  language: 'en',
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
  aiKey: '',
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
  /** User-chosen button order per board, keyed by category id ('core' for the core board). */
  wordOrder: Record<string, string[]>;
  /** User-chosen order of the category tabs. */
  categoryOrder: string[];
  /** How many times the app has been opened on this device. */
  visits: number;
}

export const emptyState: PersistedState = {
  settings: defaultSettings,
  customWords: {},
  customCategories: [],
  hiddenWordIds: [],
  recentWordIds: [],
  wordOrder: {},
  categoryOrder: [],
  visits: 0,
};

function freshState(childName = ''): PersistedState {
  return {
    ...emptyState,
    settings: { ...defaultSettings, childName },
    customWords: {},
    customCategories: [],
    hiddenWordIds: [],
    recentWordIds: [],
    wordOrder: {},
    categoryOrder: [],
  };
}

function normalizeState(parsed: Partial<PersistedState>): PersistedState {
  return {
    settings: { ...defaultSettings, ...parsed.settings },
    customWords: parsed.customWords ?? {},
    customCategories: parsed.customCategories ?? [],
    hiddenWordIds: parsed.hiddenWordIds ?? [],
    recentWordIds: parsed.recentWordIds ?? [],
    wordOrder: parsed.wordOrder ?? {},
    categoryOrder: parsed.categoryOrder ?? [],
    visits: parsed.visits ?? 0,
  };
}

function ensureAccounts(): LocalAccount[] {
  try {
    const saved = localStorage.getItem(ACCOUNT_INDEX_KEY);
    if (saved) {
      const accounts = JSON.parse(saved) as LocalAccount[];
      if (accounts.length > 0) return accounts;
    }

    const legacy = localStorage.getItem(LEGACY_KEY);
    const state = legacy ? normalizeState(JSON.parse(legacy) as Partial<PersistedState>) : freshState('Karthik');
    const account = { id: DEFAULT_ACCOUNT_ID, name: state.settings.childName.trim() || 'Default profile' };
    localStorage.setItem(ACCOUNT_INDEX_KEY, JSON.stringify([account]));
    localStorage.setItem(accountStateKey(account.id), JSON.stringify(state));
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, account.id);
    return [account];
  } catch {
    return [{ id: DEFAULT_ACCOUNT_ID, name: 'Default profile' }];
  }
}

export function loadAccounts(): LocalAccount[] {
  return ensureAccounts();
}

export function getActiveAccountId(): string {
  const accounts = ensureAccounts();
  const saved = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  return accounts.some((account) => account.id === saved) ? saved! : accounts[0].id;
}

export function setActiveAccountId(accountId: string): void {
  if (ensureAccounts().some((account) => account.id === accountId)) {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
  }
}

export function createAccount(name: string): LocalAccount {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Profile name is required.');
  const accounts = ensureAccounts();
  const account = { id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: trimmed };
  localStorage.setItem(ACCOUNT_INDEX_KEY, JSON.stringify([...accounts, account]));
  localStorage.setItem(accountStateKey(account.id), JSON.stringify(freshState(trimmed)));
  return account;
}

export function deleteAccount(accountId: string): string {
  const accounts = ensureAccounts();
  if (accounts.length <= 1) throw new Error('At least one local profile is required.');
  const remaining = accounts.filter((account) => account.id !== accountId);
  if (remaining.length === accounts.length) return getActiveAccountId();
  localStorage.setItem(ACCOUNT_INDEX_KEY, JSON.stringify(remaining));
  localStorage.removeItem(accountStateKey(accountId));
  const nextId = remaining[0].id;
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, nextId);
  return nextId;
}

export function loadState(accountId = getActiveAccountId()): PersistedState {
  try {
    ensureAccounts();
    const raw = localStorage.getItem(accountStateKey(accountId));
    return raw ? normalizeState(JSON.parse(raw) as Partial<PersistedState>) : freshState();
  } catch {
    return freshState();
  }
}

export function saveState(state: PersistedState, accountId = getActiveAccountId()): void {
  try {
    localStorage.setItem(accountStateKey(accountId), JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private browsing; the board still works in memory.
  }
}

export function exportState(state: PersistedState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(json: string): PersistedState {
  const parsed = JSON.parse(json) as Partial<PersistedState>;
  return normalizeState(parsed);
}
