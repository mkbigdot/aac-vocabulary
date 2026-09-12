import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

const DRAG_THRESHOLD = 8;

export interface DragReorder {
  dragId: string | null;
  overId: string | null;
  /** True when the last gesture moved far enough to be a drag rather than a tap. */
  wasDragged: () => boolean;
  handlers: (id: string) => Record<string, unknown>;
}

/**
 * Pointer-based drag reordering that works with a mouse and with touch on a tablet
 * (HTML5 drag and drop is not available in mobile Safari).
 *
 * `attribute` is the data attribute holding each item's id, e.g. `word-id` for `data-word-id`.
 */
export function useDragReorder(
  enabled: boolean,
  attribute: string,
  onReorder: (fromId: string, toId: string) => void,
): DragReorder {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const reset = () => {
    setDragId(null);
    setOverId(null);
    start.current = null;
  };

  const handlers = (id: string): Record<string, unknown> => {
    if (!enabled) return {};
    return {
      [`data-${attribute}`]: id,
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        start.current = { x: event.clientX, y: event.clientY };
        moved.current = false;
        setDragId(id);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
        if (dragId !== id || !start.current) return;
        if (Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > DRAG_THRESHOLD) {
          moved.current = true;
        }
        if (!moved.current) return;
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(`[data-${attribute}]`);
        setOverId(target?.getAttribute(`data-${attribute}`) ?? null);
      },
      onPointerUp: () => {
        if (moved.current && dragId && overId && dragId !== overId) onReorder(dragId, overId);
        reset();
      },
      onPointerCancel: reset,
    };
  };

  return { dragId, overId, wasDragged: () => moved.current, handlers };
}
