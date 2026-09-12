import type { Settings, Word } from '../types';
import { WordButton } from './WordButton';

interface Props {
  words: Word[];
  columns: number;
  settings: Settings;
  categoryColor?: string;
  editMode: boolean;
  onSelect: (word: Word) => void;
  onEdit: (word: Word) => void;
  onRemove: (word: Word) => void;
  onAdd: () => void;
}

export function Board({
  words,
  columns,
  settings,
  categoryColor,
  editMode,
  onSelect,
  onEdit,
  onRemove,
  onAdd,
}: Props) {
  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {words.map((word) => (
        <WordButton
          key={word.id}
          word={word}
          settings={settings}
          categoryColor={categoryColor}
          editMode={editMode}
          onSelect={onSelect}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
      {editMode && (
        <div className="cell">
          <button type="button" className="word-button add-word" onClick={onAdd}>
            <span className="word-symbol" aria-hidden="true">
              ➕
            </span>
            <span className="word-label">Add word</span>
          </button>
        </div>
      )}
    </div>
  );
}
