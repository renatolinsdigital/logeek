import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { makeTemporaryDirectory, runHook } from './testHelpers.mjs';

const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const hookPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'no-dashes.mjs');

function writeTemporaryFile(fileName, content) {
  const filePath = path.join(makeTemporaryDirectory(), fileName);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe('no-dashes', () => {
  it('blocks a written file that holds an em dash and names the line', () => {
    const filePath = writeTemporaryFile('notes.md', `fine line\nsecond ${EM_DASH} line\n`);
    const result = runHook('no-dashes.mjs', { tool_name: 'Write', tool_input: { file_path: filePath } });
    assert.equal(result.exitCode, 2);
    assert.match(result.stderr, /2: second/);
  });

  it('blocks an en dash too', () => {
    const filePath = writeTemporaryFile('range.md', `pages 1${EN_DASH}16\n`);
    assert.equal(runHook('no-dashes.mjs', { tool_input: { file_path: filePath } }).exitCode, 2);
  });

  it('passes hyphens inside words and box drawing in diagrams', () => {
    const filePath = writeTemporaryFile('ok.md', 'a scroll-driven, in-memory store\n──│ diagram\n');
    assert.equal(runHook('no-dashes.mjs', { tool_input: { file_path: filePath } }).exitCode, 0);
  });

  it('skips the writing style rule, which quotes what it bans', () => {
    const filePath = writeTemporaryFile('writing-style.md', `never ${EM_DASH}\n`);
    assert.equal(runHook('no-dashes.mjs', { tool_input: { file_path: filePath } }).exitCode, 0);
  });

  it('fails the command line check when any listed file has a dash', () => {
    const cleanFile = writeTemporaryFile('clean.md', 'clean\n');
    const dashedFile = writeTemporaryFile('dashed.md', `bad ${EM_DASH} text\n`);
    const result = spawnSync(process.execPath, [hookPath, '--check', cleanFile, dashedFile], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /dashed\.md/);
    assert.doesNotMatch(result.stderr, /clean\.md/);
  });
});
