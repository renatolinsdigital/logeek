import { useCallback, useEffect } from 'react';
import { showToast } from '@/shared/components';
import { decodeBoard, encodeBoard, SHARE_HASH_PREFIX } from '@/domain/logic';
import { selectBoard, useBoardStore } from '@/domain/store';

function buildShareUrl(): string {
  const board = selectBoard(useBoardStore.getState());
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}${SHARE_HASH_PREFIX}${encodeBoard(board)}`;
}

/** Copies a link that opens this exact board, cards and test values included. */
export function useCopyShareLink(): () => Promise<void> {
  return useCallback(async () => {
    const shareUrl = buildShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Share link copied. Paste it to your team!');
    } catch {
      // Without clipboard access (an insecure origin, a denied permission) the
      // link goes into the address bar, where it can still be copied by hand.
      window.history.replaceState(null, '', shareUrl);
      showToast('Copy the link from the address bar to share this board.');
    }
  }, []);
}

/** Opens a board shared through `#board=...`, then tidies the address bar. */
export function useLoadSharedBoard(): void {
  useEffect(() => {
    const { hash, pathname, search } = window.location;
    if (!hash.startsWith(SHARE_HASH_PREFIX)) return;

    const sharedBoard = decodeBoard(hash.slice(SHARE_HASH_PREFIX.length));
    window.history.replaceState(null, '', `${pathname}${search}`);

    if (!sharedBoard) {
      showToast('That share link is broken, so your own board stays.');
      return;
    }

    const previousBoard = selectBoard(useBoardStore.getState());
    useBoardStore.getState().loadBoard(sharedBoard);
    showToast('Shared board loaded.', {
      action: {
        label: 'Undo',
        onAction: () => useBoardStore.getState().loadBoard(previousBoard),
      },
    });
  }, []);
}
