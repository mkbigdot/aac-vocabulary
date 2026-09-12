import { describe, expect, it } from 'vitest';
import { correctSentence } from './grammar';
import type { PartOfSpeech, SentenceItem } from '../types';

const sentence = (...words: [string, PartOfSpeech][]): SentenceItem[] =>
  words.map(([label, pos], index) => ({
    key: `${label}-${index}`,
    word: { id: `${label}-${index}`, label, symbol: '⭐', pos },
  }));

describe('correctSentence', () => {
  it('agrees the verb with a third person subject', () => {
    expect(correctSentence(sentence(['he', 'pronoun'], ['eat', 'verb']))).toBe('He eats.');
    expect(correctSentence(sentence(['they', 'pronoun'], ['eat', 'verb']))).toBe('They eat.');
  });

  it('picks the right form of "to be"', () => {
    expect(correctSentence(sentence(['I', 'pronoun'], ['is', 'verb'], ['happy', 'adjective']))).toBe('I am happy.');
    expect(correctSentence(sentence(['we', 'pronoun'], ['am', 'verb'], ['ready', 'adjective']))).toBe('We are ready.');
    expect(correctSentence(sentence(['she', 'pronoun'], ['were', 'verb'], ['sad', 'adjective']))).toBe('She was sad.');
  });

  it('makes a progressive form after "to be"', () => {
    expect(correctSentence(sentence(['I', 'pronoun'], ['am', 'verb'], ['go', 'verb']))).toBe('I am going.');
  });

  it('turns a negated verb into do-support', () => {
    expect(correctSentence(sentence(['he', 'pronoun'], ['not', 'negation'], ['like', 'verb']))).toBe(
      "He doesn't like.",
    );
    expect(correctSentence(sentence(['I', 'pronoun'], ['not', 'negation'], ['like', 'verb']))).toBe("I don't like.");
  });

  it('fixes the article before a vowel', () => {
    expect(correctSentence(sentence(['I', 'pronoun'], ['want', 'verb'], ['a', 'determiner'], ['apple', 'noun']))).toBe(
      'I want an apple.',
    );
  });

  it('ends a question with a question mark', () => {
    expect(correctSentence(sentence(['where', 'question'], ['is', 'verb'], ['mum', 'noun']))).toBe('Where is mum?');
  });

  it('keeps an ending the user chose', () => {
    const items = sentence(['I', 'pronoun'], ['play', 'verb']);
    items[1].form = 'played';
    expect(correctSentence(items)).toBe('I played.');
  });

  it('returns an empty string for an empty sentence', () => {
    expect(correctSentence([])).toBe('');
  });
});
