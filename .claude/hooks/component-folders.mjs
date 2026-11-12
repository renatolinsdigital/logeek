#!/usr/bin/env node
// PostToolUse hook for Write. Every component lives in a folder of its own
// (components/Button/Button.tsx beside Button.module.scss and index.ts), in any
// framework. A component file written straight into a `components` folder is
// reported, so the assistant moves it in the same turn. Only new files are
// checked: editing an older file never nags.
// Convention: {boilerplate}/guides/architecture/components.md.

import fs from 'node:fs';

// Angular 20 and later name files without the `.component` suffix
// (user-card.ts, user-card.html), so a loose template or stylesheet counts too.
// Sass partials (_tokens.scss) may sit in the folder.
const COMPONENT_FILE = /\.(tsx|jsx|vue|svelte|html)$|\.component\.ts$|^[^_].*\.(scss|css)$/;
const BARREL_FILE = /^index\.(ts|tsx|js|jsx)$/;

let payload;
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path;
if (typeof filePath === 'string') {
  const pathParts = filePath.split(/[\\/]/);
  const fileName = pathParts.at(-1);
  const parentFolder = pathParts.at(-2) ?? '';
  const isLooseComponent =
    parentFolder.toLowerCase() === 'components' &&
    COMPONENT_FILE.test(fileName) &&
    !BARREL_FILE.test(fileName);
  if (isLooseComponent) {
    const componentName = fileName.split('.')[0];
    const componentsFolder = pathParts.slice(0, -1).join('/');
    process.stderr.write(
      `${fileName} sits directly in ${componentsFolder}. Each component has a folder of its own: ` +
        `move it to ${componentsFolder}/${componentName}/ beside its style file and an index barrel ` +
        '(guides/architecture/components.md in dev-boilerplate).\n',
    );
    process.exit(2);
  }
}
