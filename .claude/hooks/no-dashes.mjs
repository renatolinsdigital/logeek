#!/usr/bin/env node
// Reports em and en dashes in text a person reads (.claude/rules/writing-style.md).
// As a PostToolUse hook (Edit, Write, MultiEdit) it checks the file just written
// and, on a hit, exits 2 so the assistant sees the lines and fixes them in the
// same turn. From the command line it checks files for the git pre-commit hook:
//
//   node .claude/hooks/no-dashes.mjs --check <file>...
//   node .claude/hooks/no-dashes.mjs --check-all      (every file git tracks)

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Written as escapes so this file passes its own check.
const BANNED_DASH = /[\u2013\u2014]/;
// The rule page quotes the characters it bans.
const EXEMPT_FILE_NAMES = new Set(['writing-style.md', 'package-lock.json']);
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_REPORTED_LINES = 10;

function findDashLines(filePath) {
  if (EXEMPT_FILE_NAMES.has(path.basename(filePath))) return [];
  if (filePath.split(/[\\/]/).includes('node_modules')) return [];
  let content;
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size > MAX_FILE_BYTES) return [];
    content = fs.readFileSync(filePath);
  } catch {
    return [];
  }
  if (content.subarray(0, 8000).includes(0)) return [];
  const hits = [];
  content
    .toString('utf8')
    .split('\n')
    .forEach((line, lineIndex) => {
      if (BANNED_DASH.test(line)) hits.push(`${lineIndex + 1}: ${line.trim().slice(0, 160)}`);
    });
  return hits;
}

function runAsHook() {
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return 0;
  }
  const filePath = payload?.tool_input?.file_path;
  if (typeof filePath !== 'string') return 0;
  const hits = findDashLines(filePath);
  if (!hits.length) return 0;
  process.stderr.write(
    [
      `Dash check failed for ${filePath}.`,
      'Em and en dashes are banned in anything a person reads (.claude/rules/writing-style.md).',
      'Rewrite these lines with a colon, a comma, brackets, or two sentences:',
      ...hits.slice(0, MAX_REPORTED_LINES),
    ].join('\n') + '\n',
  );
  return 2;
}

function runAsCheck(filePaths) {
  let failedFiles = 0;
  for (const filePath of filePaths) {
    const hits = findDashLines(filePath);
    if (!hits.length) continue;
    failedFiles++;
    process.stderr.write(`${filePath}\n${hits.slice(0, MAX_REPORTED_LINES).map((hit) => `  ${hit}`).join('\n')}\n`);
  }
  if (failedFiles) {
    process.stderr.write(
      `Em or en dashes in ${failedFiles} file(s). See .claude/rules/writing-style.md for what to write instead.\n`,
    );
  }
  return failedFiles ? 1 : 0;
}

function trackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
  return output.split('\0').filter(Boolean);
}

const [mode, ...fileArguments] = process.argv.slice(2);
if (mode === '--check') process.exitCode = runAsCheck(fileArguments);
else if (mode === '--check-all') process.exitCode = runAsCheck(trackedFiles());
else process.exitCode = runAsHook();
