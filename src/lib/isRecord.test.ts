import { describe, expect, it } from 'vitest';
import { isRecord } from './isRecord';

describe('isRecord', () => {
  it('is true only for plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ name: 'speed' })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(isRecord('text')).toBe(false);
    expect(isRecord(42)).toBe(false);
  });
});
