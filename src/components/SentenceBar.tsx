import type { SentenceItem } from '../types';

interface Props {
  items: SentenceItem[];
  onSpeak: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onRemove: (key: string) => void;
}

export function SentenceBar({ items, onSpeak, onBackspace, onClear, onRemove }: Props) {
  return (
    <div className="sentence-bar">
      <button type="button" className="sentence-strip" onClick={onSpeak} aria-label="Speak sentence">
        {items.length === 0 ? (
          <span className="sentence-placeholder">Tap words to build a sentence…</span>
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
