import type { Settings, Word } from '../types';
import { posColors } from '../lib/colors';

interface Props {
  word: Word;
  settings: Settings;
  categoryColor?: string;
  editMode: boolean;
  /** Pointer handlers that let the button be dragged to a new position in edit mode. */
  dragHandlers?: Record<string, unknown>;
  dragState?: 'dragging' | 'over';
  onSelect: (word: Word) => void;
  onEdit: (word: Word) => void;
  onRemove: (word: Word) => void;
}

export function WordButton({
  word,
  settings,
  categoryColor,
  editMode,
  dragHandlers,
  dragState,
  onSelect,
  onEdit,
  onRemove,
}: Props) {
  const background = settings.highContrast
    ? '#000'
    : settings.colorByPartOfSpeech
      ? posColors[word.pos]
      : (categoryColor ?? '#fff');

  return (
    <div className={`cell${dragState ? ` ${dragState}` : ''}`} {...dragHandlers}>
      <button
        type="button"
        className="word-button"
        style={{ background }}
        aria-label={word.label}
        onClick={() => onSelect(word)}
      >
        <span className="word-symbol" aria-hidden="true">
          {word.symbol}
        </span>
        {settings.showLabels && <span className="word-label">{word.label}</span>}
      </button>
      {editMode && (
        <div className="cell-actions">
          <button type="button" title={`Edit ${word.label}`} onClick={() => onEdit(word)}>
            ✏️
          </button>
          <button type="button" title={`Remove ${word.label}`} onClick={() => onRemove(word)}>
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
