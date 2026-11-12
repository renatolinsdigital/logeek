import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { makeTemporaryDirectory, runHook } from './testHelpers.mjs';

function makeProject(boilerplateRecord) {
  const projectDirectory = makeTemporaryDirectory();
  if (boilerplateRecord) {
    fs.mkdirSync(path.join(projectDirectory, '.claude'));
    fs.writeFileSync(
      path.join(projectDirectory, '.claude', 'boilerplate.json'),
      JSON.stringify({ boilerplate: boilerplateRecord }),
    );
  }
  return projectDirectory;
}

function makeBoilerplate(version) {
  const boilerplateDirectory = makeTemporaryDirectory();
  fs.writeFileSync(path.join(boilerplateDirectory, 'package.json'), JSON.stringify({ version }));
  return boilerplateDirectory;
}

function contextFor(projectDirectory) {
  const result = runHook('boilerplate-drift.mjs', {}, { CLAUDE_PROJECT_DIR: projectDirectory });
  return result.output?.hookSpecificOutput?.additionalContext ?? null;
}

describe('boilerplate-drift', () => {
  it('stays silent where there is no boilerplate record, as in the boilerplate itself', () => {
    assert.equal(contextFor(makeProject(null)), null);
  });

  it('stays silent when the project follows the current boilerplate version', () => {
    const localPath = makeBoilerplate('0.3.0');
    assert.equal(contextFor(makeProject({ localPath, version: '0.3.0', repository: 'owner/dev-boilerplate' })), null);
  });

  it('says so when the local boilerplate has moved ahead', () => {
    const localPath = makeBoilerplate('0.10.0');
    const context = contextFor(makeProject({ localPath, version: '0.9.2', repository: 'owner/dev-boilerplate' }));
    assert.match(context, /0\.9\.2/);
    assert.match(context, /0\.10\.0/);
    assert.match(context, /boilerplate-sync/);
  });

  it('points to GitHub when the boilerplate is missing from this machine', () => {
    const context = contextFor(
      makeProject({ localPath: path.join(makeTemporaryDirectory(), 'nowhere'), version: '0.1.0', repository: 'owner/dev-boilerplate' }),
    );
    assert.match(context, /owner\/dev-boilerplate/);
  });
});
