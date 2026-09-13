import { describe, expect, it } from 'vitest';
import { columnsFor } from './useFittingColumns';

describe('columnsFor', () => {
  it('gives a phone a few large buttons per row', () => {
    expect(columnsFor(12, 390, 844)).toBe(4);
  });

  it('packs more buttons in when the phone is rotated', () => {
    expect(columnsFor(12, 844, 390)).toBe(12);
  });

  it('keeps the full grid on a tablet or desktop', () => {
    expect(columnsFor(12, 1024, 768)).toBe(10);
    expect(columnsFor(12, 1440, 900)).toBe(12);
  });

  it('never returns more than asked for', () => {
    expect(columnsFor(6, 1440, 900)).toBe(6);
  });

  it('always leaves at least two columns', () => {
    expect(columnsFor(12, 200, 400)).toBe(2);
  });
});
