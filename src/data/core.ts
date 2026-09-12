import type { PartOfSpeech, Word } from '../types';

type Entry = [label: string, symbol: string, pos: PartOfSpeech, speak?: string];

const w = ([label, symbol, pos, speak]: Entry): Word => ({
  id: `core:${label.toLowerCase().replace(/\s+/g, '-')}`,
  label,
  symbol,
  pos,
  ...(speak ? { speak } : {}),
});

/**
 * High frequency core vocabulary, laid out as a 12 column motor-planning grid so
 * every word keeps a stable position the way a dedicated AAC device does.
 */
const rows: Entry[][] = [
  [
    ['finished', '🏁', 'adjective'],
    ['mine', '🙋', 'pronoun'],
    ['little', '🐜', 'adjective'],
    ['up', '⬆️', 'preposition'],
    ['yes', '👍', 'social'],
    ['good', '😊', 'adjective'],
    ['some', '🫴', 'determiner'],
    ['no', '👎', 'negation'],
    ['down', '⬇️', 'preposition'],
    ['out', '📤', 'preposition'],
    ['off', '🔌', 'preposition'],
    ['bad', '😠', 'adjective'],
  ],
  [
    ['me', '👈', 'pronoun'],
    ['my', '🏷️', 'pronoun'],
    ['wear', '👔', 'verb'],
    ['am', '🧍', 'verb'],
    ['please', '🙏', 'social'],
    ['that', '👉', 'determiner'],
    ['and', '➕', 'conjunction'],
    ['in', '📥', 'preposition'],
    ['what', '❓', 'question'],
    ['a', '🅰️', 'determiner'],
    ['there', '📍', 'adverb'],
    ['here', '🎯', 'adverb'],
  ],
  [
    ['I', '🙂', 'pronoun'],
    ['we', '👨‍👩‍👧', 'pronoun'],
    ['are', '🧑‍🤝‍🧑', 'verb'],
    ['is', '🪣', 'verb'],
    ['were', '⏪', 'verb'],
    ['was', '🕰️', 'verb'],
    ['on', '🔛', 'preposition'],
    ['to', '➡️', 'preposition'],
    ['who', '🧑‍🦰', 'question'],
    ['an', '🔤', 'determiner'],
    ['the', '📘', 'determiner'],
    ['end', '🔚', 'noun'],
  ],
  [
    ['you', '👉', 'pronoun'],
    ['they', '👥', 'pronoun'],
    ['new', '✨', 'adjective'],
    ['play', '🎲', 'verb'],
    ['like', '👍', 'verb'],
    ['work', '🔨', 'verb'],
    ['have', '💰', 'verb'],
    ['feel', '🎭', 'verb'],
    ['read', '📖', 'verb'],
    ['more', '➕', 'determiner'],
    ['fast', '👟', 'adjective'],
    ['stop', '🛑', 'verb'],
  ],
  [
    ['it', '🐑', 'pronoun'],
    ['he', '👦', 'pronoun'],
    ['want', '🤲', 'verb'],
    ['all', '💯', 'determiner'],
    ['come', '🐕', 'verb'],
    ['time', '⌚', 'noun'],
    ['do', '🤞', 'verb'],
    ['go', '🚦', 'verb'],
    ['get', '🫳', 'verb'],
    ['big', '🐘', 'adjective'],
    ['color', '🌈', 'noun'],
    ['help', '🆘', 'verb'],
  ],
  [
    ['she', '👧', 'pronoun'],
    ['look', '👁️', 'verb'],
    ['slow', '🐌', 'adjective'],
    ['hear', '👂', 'verb'],
    ['think', '💡', 'verb'],
    ['right', '➡️', 'adjective'],
    ['said', '📣', 'verb'],
    ['live', '🏠', 'verb'],
    ['love', '❤️', 'verb'],
    ['follow', '🚶‍➡️', 'verb'],
    ['ride', '🚚', 'verb'],
    ['put', '📦', 'verb'],
  ],
  [
    ['where', '🗺️', 'question'],
    ['not', '🚫', 'negation'],
    ['talk', '💬', 'verb'],
    ['sit', '🪑', 'verb'],
    ['eat', '🍎', 'verb'],
    ['find', '🔍', 'verb'],
    ['make', '🧩', 'verb'],
    ['need', '☂️', 'verb'],
    ['drink', '🥤', 'verb'],
    ['watch', '📺', 'verb'],
    ['turn', '🔄', 'verb'],
    ['sleep', '🛏️', 'verb'],
  ],
];

export const CORE_COLUMNS = 12;

export const coreWords: Word[] = rows.flat().map(w);
