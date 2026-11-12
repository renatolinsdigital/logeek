import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { permissionDecisionOf, runHook } from './testHelpers.mjs';

function decisionFor(toolName, toolInput) {
  return permissionDecisionOf(runHook('protect-secrets.mjs', { tool_name: toolName, tool_input: toolInput }));
}

describe('protect-secrets', () => {
  it('denies reading an env file or a private key', () => {
    for (const filePath of ['.env', 'apps/api/.env.local', 'C:\\app\\.env.production', 'certs/server.key', 'deploy.pem']) {
      assert.equal(decisionFor('Read', { file_path: filePath }), 'deny', filePath);
    }
  });

  it('lets the example env file be read, since it holds names and not values', () => {
    for (const filePath of ['.env.example', 'apps/api/.env.sample', '.env.production.example']) {
      assert.equal(decisionFor('Read', { file_path: filePath }), null, filePath);
    }
  });

  it('asks before writing a secrets file', () => {
    assert.equal(decisionFor('Write', { file_path: '.env', content: 'A=1' }), 'ask');
    assert.equal(decisionFor('Write', { file_path: '.env.example', content: 'A=' }), null);
  });

  it('denies shell commands that print a secrets file', () => {
    for (const command of [
      'cat .env',
      'Get-Content apps/api/.env.local',
      'grep DATABASE_URL .env',
      'node -e "console.log(require(\'fs\').readFileSync(\'.env\', \'utf8\'))"',
    ]) {
      assert.equal(decisionFor('Bash', { command }), 'deny', command);
    }
  });

  it('lets commands that copy the example or mention process.env through', () => {
    for (const command of ['cp .env.example .env', 'cat .env.example', 'grep -rn "process.env.PORT" src']) {
      assert.equal(decisionFor('Bash', { command }), null, command);
    }
  });

  it('denies a grep aimed at an env file', () => {
    assert.equal(decisionFor('Grep', { pattern: 'SECRET', path: '.env' }), 'deny');
    assert.equal(decisionFor('Grep', { pattern: 'SECRET', path: 'src' }), null);
  });
});
