import type { SentenceItem } from '../types';

interface Props {
  items: SentenceItem[];
  /** The child's name, shown in the empty-board prompt. */
  greeting?: string;
  /** The tidied sentence that will actually be spoken. */
  preview: string;
  onSpeak: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onRemove: (key: string) => void;
}

export function SentenceBar({ items, greeting, preview, onSpeak, onBackspace, onClear, onRemove }: Props) {
  return (
    <div className="sentence-bar">
      <button type="button" className="sentence-strip" onClick={onSpeak} aria-label="Speak sentence">
        {items.length === 0 ? (
          <span className="sentence-placeholder">
            {greeting ? `Hi ${greeting}, tap words to build a sentence…` : 'Tap words to build a sentence…'}
          </span>
        ) : (
          items.map((item) => (
            <span
              key={item.key}
              className="sentence-chip"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(item.key);
              }}
            >
              <span aria-hidden="true">{item.word.symbol}</span>
              <span>{item.form ?? item.word.label}</span>
            </span>
          ))
        )}
        {preview && <span className="sentence-preview">{preview}</span>}
      </button>
      <div className="sentence-actions">
        <button type="button" className="action speak" onClick={onSpeak} title="Speak">
          🔊
        </button>
        <button type="button" className="action" onClick={onBackspace} title="Delete last word">
          ⌫
        </button>
        <button type="button" className="action" onClick={onClear} title="Clear sentence">
          🧹
        </button>
      </div>
    </div>
  );
}
