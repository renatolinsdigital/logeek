import { describe, expect, it } from 'vitest';
import { pluralize } from './pluralize';

describe('pluralize', () => {
  it('uses the singular for exactly one and the plural otherwise', () => {
    expect(pluralize(1, 'card')).toBe('1 card');
    expect(pluralize(0, 'card')).toBe('0 cards');
    expect(pluralize(3, 'card')).toBe('3 cards');
  });

  it('takes an irregular plural', () => {
    expect(pluralize(2, 'entry', 'entries')).toBe('2 entries');
  });
});
