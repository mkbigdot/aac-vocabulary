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

export type AppLanguage =
  | 'en'
  | 'es'
  | 'te'
  | 'hi'
  | 'ta'
  | 'kn'
  | 'ru'
  | 'de'
  | 'it'
  | 'zh'
  | 'bn'
  | 'gu'
  | 'mr'
  | 'ar'
  | 'fr'
  | 'pt'
  | 'ur'
  | 'pa'
  | 'ml'
  | 'id'
  | 'ko';

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
  /** The child's name, used to greet them and as a button for saying their own name. */
  childName: string;
  /** Language used for built-in labels and speech. */
  language: AppLanguage;
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
  /** Google Gemini key for the talk buddy, kept on this device only. Empty means offline buddy. */
  aiKey: string;
}

export interface SentenceItem {
  key: string;
  word: Word;
  /** Inflected surface form, when a grammar ending has been applied. */
  form?: string;
}
