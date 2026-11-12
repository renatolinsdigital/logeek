import { describe, expect, it } from 'vitest';
import { createId } from './createId';

describe('createId', () => {
  it('prefixes a short random id', () => {
    expect(createId('card')).toMatch(/^card_[0-9a-f]{8}$/);
  });

  it('gives a different id every time', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createId('condition')));

    expect(ids.size).toBe(50);
  });
});
