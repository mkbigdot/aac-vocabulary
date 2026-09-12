import type { PartOfSpeech } from '../types';

/** Modified Fitzgerald key: consistent colours help learners find words by type. */
export const posColors: Record<PartOfSpeech, string> = {
  pronoun: '#ffe066',
  verb: '#9be49b',
  adjective: '#a8d8ff',
  adverb: '#c9b6ff',
  noun: '#ffc07a',
  preposition: '#ffffff',
  question: '#d9b8ff',
  social: '#ffb6d9',
  negation: '#ff9a9a',
  determiner: '#cfe3ff',
  conjunction: '#e6e6e6',
  number: '#e0e0e0',
  letter: '#e0e0e0',
};

export const posLabels: Record<PartOfSpeech, string> = {
  pronoun: 'Pronoun',
  verb: 'Verb',
  adjective: 'Describing word',
  adverb: 'Adverb',
  noun: 'Noun',
  preposition: 'Preposition',
  question: 'Question word',
  social: 'Social word',
  negation: 'Negation',
  determiner: 'Determiner',
  conjunction: 'Joining word',
  number: 'Number',
  letter: 'Letter',
};
