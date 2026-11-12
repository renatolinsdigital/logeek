import { act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from '@/shared/components';
import {
  createExampleBoard,
  decodeBoard,
  encodeBoard,
  SHARE_HASH_PREFIX,
  toLogeekJson,
} from '@/domain/logic';
import { createInitialBoardData, selectBoard, useBoardStore } from '@/domain/store';
import { useCopyShareLink, useLoadSharedBoard } from './useShareLink';

function getToastMessages(): string[] {
  return useToastStore.getState().toasts.map((toast) => toast.message);
}

function getBoardLogic() {
  return toLogeekJson(selectBoard(useBoardStore.getState()));
}

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
  useToastStore.setState({ toasts: [] });
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('useCopyShareLink', () => {
  it('copies a link to this page that opens this exact board', async () => {
    userEvent.setup();
    window.history.replaceState(null, '', '/app?team=1');
    const { result } = renderHook(() => useCopyShareLink());

    await act(() => result.current());

    const shareUrl = await navigator.clipboard.readText();
    const [pageUrl, encodedBoard] = shareUrl.split(SHARE_HASH_PREFIX);
    expect(pageUrl).toBe(`${window.location.origin}/app?team=1`);
    expect(toLogeekJson(decodeBoard(encodedBoard ?? '')!)).toEqual(getBoardLogic());
    expect(getToastMessages()).toEqual(['Share link copied. Paste it to your team!']);
  });

  it('puts the link in the address bar when the clipboard is blocked', async () => {
    userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    const { result } = renderHook(() => useCopyShareLink());

    await act(() => result.current());

    expect(window.location.hash.startsWith(SHARE_HASH_PREFIX)).toBe(true);
    expect(getToastMessages()).toEqual(['Copy the link from the address bar to share this board.']);
  });
});

describe('useLoadSharedBoard', () => {
  it('opens the board in the link, tidies the address and offers Undo', () => {
    const sharedBoard = { ...createExampleBoard(), otherwise: 'From the link' };
    const previousLogic = getBoardLogic();
    window.history.replaceState(
      null,
      '',
      `/?team=1${SHARE_HASH_PREFIX}${encodeBoard(sharedBoard)}`,
    );

    renderHook(() => useLoadSharedBoard());

    expect(useBoardStore.getState().otherwise).toBe('From the link');
    expect(window.location.hash).toBe('');
    expect(window.location.search).toBe('?team=1');
    expect(getToastMessages()).toEqual(['Shared board loaded.']);

    act(() => useToastStore.getState().toasts[0]?.action?.onAction());
    expect(getBoardLogic()).toEqual(previousLogic);
  });

  it('keeps the board and says so when the link is broken', () => {
    const boardBefore = selectBoard(useBoardStore.getState());
    window.history.replaceState(null, '', `/${SHARE_HASH_PREFIX}not-a-board`);

    renderHook(() => useLoadSharedBoard());

    expect(selectBoard(useBoardStore.getState())).toEqual(boardBefore);
    expect(window.location.hash).toBe('');
    expect(getToastMessages()).toEqual(['That share link is broken, so your own board stays.']);
  });

  it('does nothing when the address holds no board', () => {
    window.history.replaceState(null, '', '/#section');

    renderHook(() => useLoadSharedBoard());

    expect(window.location.hash).toBe('#section');
    expect(getToastMessages()).toEqual([]);
  });
});
