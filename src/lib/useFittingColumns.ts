import { useEffect, useState } from 'react';

/** Smallest comfortable touch target for a child, in CSS pixels. */
const MIN_BUTTON = 78;
const GAP = 5;

function fit(requested: number, width: number): number {
  const possible = Math.max(3, Math.floor((width - 12 + GAP) / (MIN_BUTTON + GAP)));
  return Math.min(requested, possible);
}

/**
 * Caps the number of buttons per row so they never shrink below a tappable size;
 * on a phone this turns a 12-column board into a few large buttons per row.
 */
export function useFittingColumns(requested: number): number {
  const [columns, setColumns] = useState(() =>
    fit(requested, typeof window === 'undefined' ? 1024 : window.innerWidth),
  );

  useEffect(() => {
    const update = () => setColumns(fit(requested, window.innerWidth));
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [requested]);

  return columns;
}
