import { useEffect, useState } from 'react';

const GAP = 5;
const PADDING = 12;

/**
 * Smallest comfortable touch target for the current device: bigger on a phone so labels stay
 * readable, smaller when the screen is short (phone in landscape) so rows still fit.
 */
function minButton(width: number, height: number): number {
  if (height < 520) return 64;
  if (width < 480) return 76;
  if (width < 900) return 84;
  return 92;
}

/** Buttons that fit across a screen of this size, never more than `requested`. */
export function columnsFor(requested: number, width: number, height: number): number {
  const possible = Math.max(2, Math.floor((width - PADDING + GAP) / (minButton(width, height) + GAP)));
  return Math.min(requested, possible);
}

function viewport(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 1024, height: 768 };
  return {
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  };
}

/**
 * Buttons per row for the device in use: the requested number is capped so buttons never shrink
 * below a tappable size, and it is recalculated when the window is resized or the device rotated.
 */
export function useFittingColumns(requested: number): number {
  const [columns, setColumns] = useState(() => {
    const { width, height } = viewport();
    return columnsFor(requested, width, height);
  });

  useEffect(() => {
    const update = () => {
      const { width, height } = viewport();
      setColumns(columnsFor(requested, width, height));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, [requested]);

  return columns;
}
