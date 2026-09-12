import { describe, expect, it } from 'vitest';
import { applyEnding } from './morphology';

describe('applyEnding', () => {
  it('uses irregular forms', () => {
    expect(applyEnding('go', 'ed')).toBe('went');
    expect(applyEnding('good', 'est')).toBe('best');
    expect(applyEnding('foot', 's')).toBe('feet');
    expect(applyEnding('eat', 'en')).toBe('eaten');
  });

  it('applies regular spelling rules', () => {
    expect(applyEnding('watch', 's')).toBe('watches');
    expect(applyEnding('carry', 's')).toBe('carries');
    expect(applyEnding('make', 'ing')).toBe('making');
    expect(applyEnding('sit', 'ing')).toBe('sitting');
    expect(applyEnding('play', 'ed')).toBe('played');
    expect(applyEnding('hurry', 'ed')).toBe('hurried');
    expect(applyEnding('big', 'est')).toBe('biggest');
    expect(applyEnding('nice', 'er')).toBe('nicer');
  });

  it('keeps the original capitalisation', () => {
    expect(applyEnding('Play', 'ing')).toBe('Playing');
  });
});
