import { describe, expect, it } from 'vitest';
import { localizeCategory, localizeWord, translate } from './i18n';

describe('translations', () => {
  it('translates core AAC words into Spanish and Telugu', () => {
    expect(translate('want', 'es')).toBe('quiero');
    expect(translate('want', 'te')).toBe('కావాలి');
  });

  it('translates core AAC words into Hindi and Tamil', () => {
    expect(translate('want', 'hi')).toBe('चाहिए');
    expect(translate('want', 'ta')).toBe('வேண்டும்');
  });

  it.each([
    ['kn', 'ಬೇಕು'],
    ['ru', 'хочу'],
    ['de', 'möchte'],
    ['it', 'voglio'],
    ['zh', '想要'],
    ['bn', 'চাই'],
    ['gu', 'જોઈએ'],
    ['mr', 'पाहिजे'],
  ] as const)('provides a translation for want in %s', (language, expected) => {
    expect(translate('want', language)).toBe(expected);
  });

  it.each([
    ['ar', 'أريد'],
    ['fr', 'je veux'],
    ['pt', 'quero'],
    ['ur', 'چاہیے'],
    ['pa', 'ਚਾਹੀਦਾ'],
    ['ml', 'വേണം'],
  ] as const)('provides a high-priority language translation in %s', (language, expected) => {
    expect(translate('want', language)).toBe(expected);
  });

  it.each([
    ['id', 'mau'],
    ['ko', '원해요'],
  ] as const)('provides the new language translation in %s', (language, expected) => {
    expect(translate('want', language)).toBe(expected);
  });

  it('preserves stable ids while translating built-in words', () => {
    const word = { id: 'core:water', label: 'water', symbol: '💧', pos: 'noun' as const };
    expect(localizeWord(word, 'te')).toMatchObject({ id: 'core:water', label: 'నీళ్లు', speak: 'నీళ్లు' });
  });

  it('does not translate custom vocabulary', () => {
    const word = { id: 'custom:1', label: 'Amma', symbol: '👩', pos: 'noun' as const, custom: true };
    expect(localizeWord(word, 'es')).toBe(word);
  });

  it('translates category names and their built-in words', () => {
    const category = {
      id: 'food',
      name: 'Food & drink',
      symbol: '🍎',
      color: '#fff',
      words: [{ id: 'food:water', label: 'water', symbol: '💧', pos: 'noun' as const }],
    };
    expect(localizeCategory(category, 'es')).toMatchObject({
      name: 'Comida y bebida',
      words: [{ id: 'food:water', label: 'agua' }],
    });
  });
});
