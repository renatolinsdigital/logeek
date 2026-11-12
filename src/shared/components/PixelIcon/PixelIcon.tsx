import { PIXEL_ICON_BITMAPS, type PixelIconName } from './pixelIconBitmaps';

export interface PixelIconProps {
  name: PixelIconName;
  /** Rendered size in pixels; the 8 by 8 bitmap scales crisply to any multiple of 8. */
  size?: number;
  className?: string;
}

interface PixelRun {
  x: number;
  y: number;
  width: number;
}

// Merges each row's neighbouring pixels into one rectangle, so an icon is a
// handful of rects instead of up to 64.
function toPixelRuns(bitmapRows: readonly string[]): PixelRun[] {
  const pixelRuns: PixelRun[] = [];
  bitmapRows.forEach((rowText, rowIndex) => {
    let runStart = -1;
    for (let columnIndex = 0; columnIndex <= rowText.length; columnIndex++) {
      const isFilled = rowText[columnIndex] === '#';
      if (isFilled && runStart < 0) runStart = columnIndex;
      if (!isFilled && runStart >= 0) {
        pixelRuns.push({ x: runStart, y: rowIndex, width: columnIndex - runStart });
        runStart = -1;
      }
    }
  });
  return pixelRuns;
}

const PIXEL_RUNS = Object.fromEntries(
  Object.entries(PIXEL_ICON_BITMAPS).map(([iconName, bitmapRows]) => [
    iconName,
    toPixelRuns(bitmapRows),
  ]),
) as Record<PixelIconName, PixelRun[]>;

/** An 8-bit icon drawn from a bitmap, in the current text colour. Decorative: label its button. */
function PixelIcon({ name, size = 16, className }: PixelIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {PIXEL_RUNS[name].map((pixelRun) => (
        <rect
          key={`${pixelRun.x}-${pixelRun.y}`}
          x={pixelRun.x}
          y={pixelRun.y}
          width={pixelRun.width}
          height={1}
        />
      ))}
    </svg>
  );
}

export default PixelIcon;
