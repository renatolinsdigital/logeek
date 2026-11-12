import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  // Tests that run in the node environment (stylesheets) have no window.
  if (typeof window !== 'undefined') window.localStorage.clear();
});
