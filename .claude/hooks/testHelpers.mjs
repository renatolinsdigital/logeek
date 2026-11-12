import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hooksDirectory = path.dirname(fileURLToPath(import.meta.url));

export function runHook(hookFileName, payload, environment = {}) {
  const result = spawnSync(process.execPath, [path.join(hooksDirectory, hookFileName)], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, ...environment },
  });
  return {
    exitCode: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    output: result.stdout ? JSON.parse(result.stdout) : null,
  };
}

export function permissionDecisionOf(hookResult) {
  return hookResult.output?.hookSpecificOutput?.permissionDecision ?? null;
}

export function makeTemporaryDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'dev-boilerplate-hooks-'));
}
