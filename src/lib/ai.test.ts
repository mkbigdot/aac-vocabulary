import { describe, expect, it } from 'vitest';
import { parseTurn } from './ai';

describe('parseTurn', () => {
  it('reads a reply, a question and answers to tap', () => {
    const turn = parseTurn('{"reply":"I am glad.","question":"What did you play?","chips":["ball","cars"]}');
    expect(turn).toEqual({ reply: 'I am glad.', question: 'What did you play?', chips: ['ball', 'cars'] });
  });

  it('copes with code fences and extra words around the answer', () => {
    const turn = parseTurn('```json\n{"reply":"Okay.","question":"Are you hungry?","chips":["yes"]}\n```');
    expect(turn?.question).toBe('Are you hungry?');
  });

  it('keeps at most six answers to tap', () => {
    const chips = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const turn = parseTurn(JSON.stringify({ reply: 'Okay.', question: 'Which one?', chips }));
    expect(turn?.chips).toHaveLength(6);
  });

  it('gives nothing back when the model did not answer properly', () => {
    expect(parseTurn('sorry, I cannot')).toBeNull();
    expect(parseTurn('{"reply":"Okay."}')).toBeNull();
    expect(parseTurn('{"reply":"","question":"Hi?"}')).toBeNull();
  });

  it('ignores answers to tap that are not words', () => {
    const turn = parseTurn('{"reply":"Okay.","question":"Hungry?","chips":["yes",3,null,"  "]}');
    expect(turn?.chips).toEqual(['yes']);
  });
});
