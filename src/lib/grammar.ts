import { applyEnding } from './morphology';
import type { SentenceItem } from '../types';

interface Token {
  text: string;
  pos: string;
  /** True when the user changed the word with a grammar ending, which is then respected. */
  inflected: boolean;
}

const BE_FORMS = new Set(['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being']);
const MODALS = new Set(['can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'do', 'does', 'did', 'to']);
const THIRD_SINGULAR = new Set(['he', 'she', 'it']);
const PLURAL_SUBJECT = new Set(['we', 'they', 'you']);
const QUESTION_WORDS = new Set(['who', 'what', 'where', 'when', 'why', 'how', 'which']);

function presentBe(subject: string): string {
  const lower = subject.toLowerCase();
  if (lower === 'i') return 'am';
  if (PLURAL_SUBJECT.has(lower)) return 'are';
  return 'is';
}

function pastBe(subject: string): string {
  const lower = subject.toLowerCase();
  if (lower === 'i' || THIRD_SINGULAR.has(lower)) return 'was';
  return 'were';
}

const isSubject = (token: Token | undefined): boolean =>
  Boolean(token) && (token!.pos === 'pronoun' || token!.pos === 'noun');

/**
 * Tidies a tapped message into a natural sentence: subject-verb agreement, progressive
 * forms after "to be", article choice, capitalisation and end punctuation.
 */
export function correctSentence(items: SentenceItem[]): string {
  const tokens: Token[] = items.flatMap((item) => {
    const surface = item.form ?? item.word.speak ?? item.word.label;
    const parts = surface.split(/\s+/).filter(Boolean);
    return parts.map((text, index) => ({
      text,
      pos: index === 0 ? item.word.pos : 'noun',
      inflected: Boolean(item.form) && index === 0,
    }));
  });

  if (tokens.length === 0) return '';

  const out: Token[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = { ...tokens[i] };
    const lower = token.text.toLowerCase();
    const previous = out[out.length - 1];
    const beforePrevious = out[out.length - 2];

    if (BE_FORMS.has(lower) && !token.inflected) {
      const subject = isSubject(previous) ? previous.text : 'it';
      token.text = lower === 'was' || lower === 'were' ? pastBe(subject) : presentBe(subject);
      out.push(token);
      continue;
    }

    if (token.pos === 'verb' && !token.inflected && previous) {
      const previousLower = previous.text.toLowerCase();

      // "I am go" -> "I am going"
      if (BE_FORMS.has(previousLower)) {
        token.text = applyEnding(token.text, 'ing');
        out.push(token);
        continue;
      }

      // "he eat" -> "he eats"
      const subjectToken = isSubject(previous) ? previous : undefined;
      const negated = previousLower === 'not' && isSubject(beforePrevious) ? beforePrevious : undefined;
      const subject = subjectToken ?? negated;
      if (subject && !MODALS.has(previousLower)) {
        const subjectLower = subject.text.toLowerCase();
        const thirdSingular =
          THIRD_SINGULAR.has(subjectLower) ||
          (subject.pos === 'noun' && !subjectLower.endsWith('s') && subjectLower !== 'people');
        if (negated) {
          out.splice(out.length - 1, 1, { text: thirdSingular ? "doesn't" : "don't", pos: 'verb', inflected: true });
        } else if (thirdSingular) {
          token.text = applyEnding(token.text, 's');
        }
        out.push(token);
        continue;
      }
    }

    // "a apple" -> "an apple"
    if (previous && (previous.text.toLowerCase() === 'a' || previous.text.toLowerCase() === 'an')) {
      previous.text = /^[aeiou]/i.test(token.text) ? 'an' : 'a';
    }

    out.push(token);
  }

  const isQuestion = QUESTION_WORDS.has(out[0].text.toLowerCase()) || out.some((t) => t.pos === 'question');
  const sentence = out
    .map((token) => (token.text === 'i' ? 'I' : token.text))
    .join(' ')
    .replace(/\s+([,.!?])/g, '$1');

  const capitalised = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return /[.!?]$/.test(capitalised) ? capitalised : capitalised + (isQuestion ? '?' : '.');
}
