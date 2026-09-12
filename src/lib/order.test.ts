import { describe, expect, it } from 'vitest';
import { moveInOrder, sortByOrder } from './order';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('sortByOrder', () => {
  it('keeps the default order when nothing is saved', () => {
    expect(sortByOrder(items).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('applies the saved order', () => {
    expect(sortByOrder(items, ['c', 'a', 'b']).map((i) => i.id)).toEqual(['c', 'a', 'b']);
  });

  it('appends items missing from the saved order', () => {
    expect(sortByOrder(items, ['c']).map((i) => i.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('moveInOrder', () => {
  it('moves an item to the position of the target', () => {
    expect(moveInOrder(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a']);
    expect(moveInOrder(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
  });

  it('ignores unknown or identical ids', () => {
    expect(moveInOrder(['a', 'b'], 'a', 'a')).toEqual(['a', 'b']);
    expect(moveInOrder(['a', 'b'], 'z', 'b')).toEqual(['a', 'b']);
  });
});
