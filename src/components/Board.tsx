import { useDragReorder } from '../lib/useDragReorder';
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
  /** Called in edit mode when a button is dragged onto another one. */
  onReorder?: (fromId: string, toId: string) => void;
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
  onReorder,
}: Props) {
  const drag = useDragReorder(Boolean(editMode && onReorder), 'word-id', (fromId, toId) =>
    onReorder?.(fromId, toId),
  );

  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {words.map((word) => (
        <WordButton
          key={word.id}
          word={word}
          settings={settings}
          categoryColor={categoryColor}
          editMode={editMode}
          dragHandlers={drag.handlers(word.id)}
          dragState={drag.dragId === word.id ? 'dragging' : drag.dragId && drag.overId === word.id ? 'over' : undefined}
          onSelect={(selected) => {
            if (editMode && drag.wasDragged()) return;
            onSelect(selected);
          }}
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
