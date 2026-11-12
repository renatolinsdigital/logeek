import { showToast } from '@/shared/components';
import type { Board } from '@/domain/models';
import { selectBoard, useBoardStore } from './useBoardStore';

/**
 * Swaps in a whole new board (examples, a clear, an import, a share link) and
 * says so in a toast whose Undo puts the previous board back.
 */
export function replaceBoardWithUndo(nextBoard: Board, message: string): void {
  const { loadBoard } = useBoardStore.getState();
  const previousBoard = selectBoard(useBoardStore.getState());
  loadBoard(nextBoard);
  showToast(message, {
    action: { label: 'Undo', onAction: () => loadBoard(previousBoard) },
  });
}
