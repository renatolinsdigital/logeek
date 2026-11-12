// @vitest-environment node
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { compile } from 'sass';
import { describe, expect, it } from 'vitest';

const sourcePath = fileURLToPath(new URL('..', import.meta.url));
const stylesPath = fileURLToPath(new URL('.', import.meta.url));

const stylesheetPaths = readdirSync(sourcePath, { recursive: true, encoding: 'utf8' })
  .filter((relativePath) => relativePath.endsWith('.scss'))
  .filter((relativePath) => !path.basename(relativePath).startsWith('_'))
  .map((relativePath) => path.join(sourcePath, relativePath));

// A Sass warning can mean the CSS is not what the source says (a colour name
// read as a colour value, say), and the build only prints it in passing.
describe('stylesheets', () => {
  it.each(stylesheetPaths.map((stylesheetPath) => [path.relative(sourcePath, stylesheetPath)]))(
    '%s compiles without a Sass warning',
    (relativePath) => {
      const warnings: string[] = [];

      compile(path.join(sourcePath, relativePath), {
        loadPaths: [stylesPath],
        logger: { warn: (message) => warnings.push(message) },
      });

      expect(warnings).toEqual([]);
    },
  );
});
