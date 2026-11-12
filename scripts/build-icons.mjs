// Draws the Logeek mark from one bitmap and writes every file that shows it:
// the SVG the header and modern browsers use, the 32px favicon.ico for the
// rest, and the 180px apple-touch-icon. Run `npm run icons` after editing MARK.
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';

// Two stacked logic cards: the pink L card in front, a cyan card behind.
// k ink, p pink, c cyan, y yellow, . transparent.
const MARK = [
  'kkkkkkkkkkkk....',
  'kppppppppppk....',
  'kppkkppyyppk....',
  'kppkkppyyppk....',
  'kppkkppppppkkkkk',
  'kppkkppppppkccck',
  'kppkkppppppkccck',
  'kppkkppppppkccck',
  'kppkkkkkkppkccck',
  'kppkkkkkkppkccck',
  'kppppppppppkccck',
  'kkkkkkkkkkkkccck',
  '....kcccccccccck',
  '....kcccccccccck',
  '....kcccccccccck',
  '....kkkkkkkkkkkk',
];

// The theme's tokens (src/styles/_theme.scss), as the icons cannot read CSS.
const PALETTE = {
  k: '#0d0a1f',
  p: '#ff3ea5',
  c: '#19e3ff',
  y: '#ffe14d',
};
const PAPER = '#fff4d6';

const GRID = MARK.length;
const outputUrl = (relativePath) => new URL(`../${relativePath}`, import.meta.url);

// One path per colour, each row's run of that colour a one-pixel-tall rectangle.
function toSvg() {
  const pathData = Object.fromEntries(Object.keys(PALETTE).map((key) => [key, '']));
  MARK.forEach((rowText, rowIndex) => {
    let runStart = 0;
    for (let columnIndex = 1; columnIndex <= rowText.length; columnIndex++) {
      if (rowText[columnIndex] === rowText[runStart]) continue;
      const width = columnIndex - runStart;
      if (rowText[runStart] in pathData) {
        pathData[rowText[runStart]] += `M${runStart} ${rowIndex}h${width}v1h-${width}z`;
      }
      runStart = columnIndex;
    }
  });
  const paths = Object.entries(pathData).map(
    ([key, data]) => `  <path fill="${PALETTE[key]}" d="${data}"/>`,
  );
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID} ${GRID}" shape-rendering="crispEdges">`,
    ...paths,
    '</svg>',
    '',
  ].join('\n');
}

function hexToRgba(hex) {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).concat(255);
}

// Each mark pixel becomes a scale by scale block, centred on a square canvas.
function toPixels(canvasSize, scale, background) {
  const padding = (canvasSize - GRID * scale) / 2;
  const backgroundRgba = background ? hexToRgba(background) : [0, 0, 0, 0];
  const pixels = Buffer.alloc(canvasSize * canvasSize * 4);
  for (let y = 0; y < canvasSize; y++) {
    for (let x = 0; x < canvasSize; x++) {
      const markRow = MARK[Math.floor((y - padding) / scale)];
      const colour = PALETTE[markRow?.[Math.floor((x - padding) / scale)]];
      const rgba = colour ? hexToRgba(colour) : backgroundRgba;
      pixels.set(rgba, (y * canvasSize + x) * 4);
    }
  }
  return pixels;
}

function pngChunk(type, data) {
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, checksum]);
}

function toPng(canvasSize, scale, background) {
  const pixels = toPixels(canvasSize, scale, background);
  const rowLength = canvasSize * 4;
  const scanlines = Buffer.alloc((rowLength + 1) * canvasSize);
  for (let y = 0; y < canvasSize; y++) {
    pixels.copy(scanlines, y * (rowLength + 1) + 1, y * rowLength, (y + 1) * rowLength);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(canvasSize, 0);
  header.writeUInt32BE(canvasSize, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA, no interlace
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(scanlines)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// An .ico holding one PNG, which every browser that still asks for one reads.
function toIco(png, size) {
  const directory = Buffer.alloc(22);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(1, 4);
  directory.set([size, size, 0, 0], 6);
  directory.writeUInt16LE(1, 10);
  directory.writeUInt16LE(32, 12);
  directory.writeUInt32LE(png.length, 14);
  directory.writeUInt32LE(directory.length, 18);
  return Buffer.concat([directory, png]);
}

writeFileSync(outputUrl('src/assets/logeek-mark.svg'), toSvg());
writeFileSync(outputUrl('public/favicon.ico'), toIco(toPng(32, 2), 32));
// iOS fills transparency with black and rounds the corners, so the touch icon
// gets the paper background and a margin the rounding cannot reach.
writeFileSync(outputUrl('public/apple-touch-icon.png'), toPng(180, 8, PAPER));
