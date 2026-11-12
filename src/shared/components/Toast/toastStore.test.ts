import { beforeEach, describe, expect, it } from 'vitest';
import { showToast, useToastStore } from './toastStore';

function getMessages(): string[] {
  return useToastStore.getState().toasts.map((toast) => toast.message);
}

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

describe('showToast', () => {
  it('stays longer when it offers an action, unless told how long', () => {
    const onAction = () => {};
    showToast('Saved.');
    showToast('Removed.', { action: { label: 'Undo', onAction } });
    showToast('Quick.', { durationMs: 500 });

    expect(useToastStore.getState().toasts.map((toast) => toast.durationMs)).toEqual([
      3000, 6000, 500,
    ]);
  });

  it('keeps only the three newest messages', () => {
    for (const message of ['one', 'two', 'three', 'four']) showToast(message);

    expect(getMessages()).toEqual(['two', 'three', 'four']);
  });

  it('gives every toast its own id and dismisses one by id', () => {
    showToast('first');
    showToast('second');
    const [firstToast, secondToast] = useToastStore.getState().toasts;
    expect(firstToast?.id).not.toBe(secondToast?.id);

    useToastStore.getState().dismissToast(firstToast!.id);

    expect(getMessages()).toEqual(['second']);
  });
});
