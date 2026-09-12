import { useState } from 'react';
import type { PartOfSpeech, Word } from '../types';
import { posLabels } from '../lib/colors';

interface Props {
  word: Word | null;
  onSave: (word: { label: string; symbol: string; pos: PartOfSpeech; speak?: string }) => void;
  onCancel: () => void;
}

export function WordEditor({ word, onSave, onCancel }: Props) {
  const [label, setLabel] = useState(word?.label ?? '');
  const [symbol, setSymbol] = useState(word?.symbol ?? '⭐');
  const [pos, setPos] = useState<PartOfSpeech>(word?.pos ?? 'noun');
  const [speakText, setSpeakText] = useState(word?.speak ?? '');

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit word">
      <div className="modal">
        <h2>{word ? 'Edit word' : 'Add word'}</h2>
        <label>
          Word or phrase
          <input value={label} onChange={(event) => setLabel(event.target.value)} autoFocus />
        </label>
        <label>
          Symbol (emoji)
          <input value={symbol} onChange={(event) => setSymbol(event.target.value)} maxLength={8} />
        </label>
        <label>
          Word type
          <select value={pos} onChange={(event) => setPos(event.target.value as PartOfSpeech)}>
            {Object.entries(posLabels).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label>
          Spoken text (optional)
          <input
            value={speakText}
            onChange={(event) => setSpeakText(event.target.value)}
            placeholder="Say something different from the label"
          />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            disabled={!label.trim() || !symbol.trim()}
            onClick={() =>
              onSave({
                label: label.trim(),
                symbol: symbol.trim(),
                pos,
                ...(speakText.trim() ? { speak: speakText.trim() } : {}),
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
