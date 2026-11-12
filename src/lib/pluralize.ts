/** A count with its noun in the right number: `1 card`, `3 cards`, `0 cards`. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
