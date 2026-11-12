#!/usr/bin/env node
// SessionStart hook. Tells the assistant when the local dev-boilerplate has
// moved past the version this project follows, or is missing from this
// machine, so the project's rules and hooks do not quietly fall behind.
// Reads two local files and nothing else: no network, no git.
// Silent in the boilerplate itself, which has no .claude/boilerplate.json.

import fs from 'node:fs';
import path from 'node:path';

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function compareVersions(leftVersion, rightVersion) {
  const leftParts = String(leftVersion).split('-')[0].split('.').map(Number);
  const rightParts = String(rightVersion).split('-')[0].split('.').map(Number);
  for (let partIndex = 0; partIndex < 3; partIndex++) {
    const difference = (leftParts[partIndex] || 0) - (rightParts[partIndex] || 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
}

const projectDirectory = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const record = readJson(path.join(projectDirectory, '.claude', 'boilerplate.json'));
const source = record?.boilerplate;

if (source) {
  const boilerplatePackage = source.localPath
    ? readJson(path.join(source.localPath, 'package.json'))
    : null;
  let message = null;
  if (!boilerplatePackage) {
    message =
      `dev-boilerplate is not at ${source.localPath} on this machine. Read its guides from GitHub ` +
      `(${source.repository}) as .claude/rules/boilerplate.md says, and offer to clone it if the task needs many of them.`;
  } else if (compareVersions(boilerplatePackage.version, source.version) > 0) {
    message =
      `This project follows dev-boilerplate ${source.version}; the copy at ${source.localPath} is at ` +
      `${boilerplatePackage.version}. Tell the user once this session, and offer /boilerplate-sync to review what changed.`;
  }
  if (message) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: message },
      }),
    );
  }
}
