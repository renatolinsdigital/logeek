import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom has <dialog> and its open attribute, but not showModal or close.
if (typeof window !== 'undefined') {
  const dialogPrototype: Partial<HTMLDialogElement> = HTMLDialogElement.prototype;
  dialogPrototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  dialogPrototype.close ??= function close(this: HTMLDialogElement) {
    this.open = false;
  };
}

afterEach(() => {
  cleanup();
  // Tests that run in the node environment (stylesheets) have no window.
  if (typeof window !== 'undefined') window.localStorage.clear();
});
