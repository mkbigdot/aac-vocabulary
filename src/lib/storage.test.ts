import { beforeEach, describe, expect, it } from 'vitest';
import {
  createAccount,
  deleteAccount,
  getActiveAccountId,
  loadAccounts,
  loadState,
  saveState,
  setActiveAccountId,
} from './storage';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe('local user profiles', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
  });

  it('creates a default profile and preserves its settings', () => {
    const account = loadAccounts()[0];
    const state = loadState(account.id);
    state.settings.language = 'te';
    saveState(state, account.id);
    expect(loadState(account.id).settings.language).toBe('te');
  });

  it('keeps settings separate for each profile', () => {
    const first = loadAccounts()[0];
    const second = createAccount('Srihan');
    const secondState = loadState(second.id);
    secondState.settings.language = 'ta';
    saveState(secondState, second.id);
    expect(loadState(first.id).settings.language).toBe('en');
    expect(loadState(second.id).settings.language).toBe('ta');
  });

  it('switches and safely deletes a profile', () => {
    const second = createAccount('Second');
    setActiveAccountId(second.id);
    expect(getActiveAccountId()).toBe(second.id);
    const nextId = deleteAccount(second.id);
    expect(nextId).toBe(loadAccounts()[0].id);
  });
});
