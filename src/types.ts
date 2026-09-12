export type PartOfSpeech =
  | 'pronoun'
  | 'verb'
  | 'noun'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'question'
  | 'social'
  | 'negation'
  | 'determiner'
  | 'conjunction'
  | 'number'
  | 'letter';

export interface Word {
  id: string;
  label: string;
  symbol: string;
  pos: PartOfSpeech;
  /** Text spoken when the word is used in a sentence, when it differs from the label. */
  speak?: string;
  custom?: boolean;
}

export interface Category {
  id: string;
  name: string;
  symbol: string;
  color: string;
  words: Word[];
  custom?: boolean;
}

export interface Settings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
  volume: number;
  columns: number;
  speakOnTap: boolean;
  autoGrammar: boolean;
  showLabels: boolean;
  highContrast: boolean;
  colorByPartOfSpeech: boolean;
}

export interface SentenceItem {
  key: string;
  word: Word;
  /** Inflected surface form, when a grammar ending has been applied. */
  form?: string;
}
