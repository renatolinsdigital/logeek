import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { runHook } from './testHelpers.mjs';

function exitCodeFor(filePath) {
  return runHook('component-folders.mjs', { tool_name: 'Write', tool_input: { file_path: filePath } }).exitCode;
}

describe('component-folders', () => {
  it('reports a component written straight into a components folder, in any framework', () => {
    for (const filePath of [
      'apps/web/src/shared/components/Button.tsx',
      'apps/web/src/domain/components/Cart.vue',
      'apps/web/src/lib/components/Modal.svelte',
      'apps/web/src/app/shared/components/user-card.component.ts',
      'apps/web/src/app/shared/components/user-card.html',
      'C:\\work\\web\\src\\shared\\components\\Button.module.scss',
    ]) {
      assert.equal(exitCodeFor(filePath), 2, filePath);
    }
  });

  it('lets a Sass partial sit in the components folder', () => {
    assert.equal(exitCodeFor('apps/web/src/shared/components/_tokens.scss'), 0);
  });

  it('accepts a component inside its own folder', () => {
    for (const filePath of [
      'apps/web/src/shared/components/Button/Button.tsx',
      'apps/web/src/shared/components/Button/Button.module.scss',
      'apps/web/src/domain/components/Cart/Cart.vue',
      'apps/web/src/app/shared/components/user-card/user-card.component.ts',
    ]) {
      assert.equal(exitCodeFor(filePath), 0, filePath);
    }
  });

  it('accepts the barrel that lists the components', () => {
    assert.equal(exitCodeFor('apps/web/src/shared/components/index.ts'), 0);
  });

  it('ignores files outside a components folder', () => {
    assert.equal(exitCodeFor('apps/web/src/App.tsx'), 0);
    assert.equal(exitCodeFor('apps/api/src/users/users.service.ts'), 0);
  });
});
