/** Sorts items by a saved list of ids; anything not in the list keeps its original place at the end. */
export function sortByOrder<T extends { id: string }>(items: T[], order?: string[]): T[] {
  if (!order || order.length === 0) return items;
  const index = new Map(order.map((id, position) => [id, position]));
  return [...items].sort((a, b) => (index.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (index.get(b.id) ?? Number.MAX_SAFE_INTEGER));
}

/** Moves `fromId` to the position of `toId`, keeping every other id in place. */
export function moveInOrder(ids: string[], fromId: string, toId: string): string[] {
  const list = [...ids];
  const from = list.indexOf(fromId);
  const to = list.indexOf(toId);
  if (from === -1 || to === -1 || from === to) return list;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  return list;
}
