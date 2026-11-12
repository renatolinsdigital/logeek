import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PixelIcon from './PixelIcon';
import { PIXEL_ICON_BITMAPS } from './pixelIconBitmaps';

function getRects(container: HTMLElement) {
  return Array.from(container.querySelectorAll('rect'), (rect) => ({
    x: Number(rect.getAttribute('x')),
    y: Number(rect.getAttribute('y')),
    width: Number(rect.getAttribute('width')),
  }));
}

describe('PixelIcon', () => {
  it('draws each row of lit pixels as one rectangle per run', () => {
    const { container } = render(<PixelIcon name="close" />);

    expect(getRects(container).slice(0, 3)).toEqual([
      { x: 0, y: 0, width: 2 },
      { x: 6, y: 0, width: 2 },
      { x: 0, y: 1, width: 3 },
    ]);
  });

  it('lights exactly the pixels of the bitmap', () => {
    for (const [iconName, bitmapRows] of Object.entries(PIXEL_ICON_BITMAPS)) {
      const { container, unmount } = render(
        <PixelIcon name={iconName as keyof typeof PIXEL_ICON_BITMAPS} />,
      );
      const litPixels = bitmapRows
        .join('')
        .split('')
        .filter((pixel) => pixel === '#').length;

      expect(getRects(container).reduce((total, rect) => total + rect.width, 0)).toBe(litPixels);
      unmount();
    }
  });

  it('is decorative, sized as asked and coloured by the text', () => {
    const { container } = render(<PixelIcon name="plus" size={24} className="glow" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveClass('glow');
  });
});
