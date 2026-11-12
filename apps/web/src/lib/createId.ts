/** A short random id for things that live only in this board (cards, conditions, variables). */
export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
