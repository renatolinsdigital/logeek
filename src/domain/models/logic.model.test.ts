import { describe, expect, it } from 'vitest';
import { CARD_COLORS, getCardColor, isCardColor } from './logic.model';

describe('card colours', () => {
  it('takes the palette in turn and wraps around', () => {
    expect(CARD_COLORS.map((_color, position) => getCardColor(position))).toEqual(CARD_COLORS);
    expect(getCardColor(CARD_COLORS.length)).toBe(CARD_COLORS[0]);
    expect(getCardColor(CARD_COLORS.length + 2)).toBe(CARD_COLORS[2]);
  });

  it('knows a palette colour from anything else', () => {
    expect(isCardColor('violet')).toBe(true);
    expect(isCardColor('purple')).toBe(false);
    expect(isCardColor(undefined)).toBe(false);
  });
});
