import { beforeEach, describe, expect, it } from 'vitest';
import { useToastStore } from '@/shared/components';
import { createExampleBoard } from '@/domain/logic';
import { replaceBoardWithUndo } from './replaceBoardWithUndo';
import {
  createEmptyBoard,
  createInitialBoardData,
  selectBoard,
  useBoardStore,
} from './useBoardStore';

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
  useToastStore.setState({ toasts: [] });
});

describe('replaceBoardWithUndo', () => {
  it('loads the new board and offers Undo in a toast', () => {
    replaceBoardWithUndo(createEmptyBoard(), 'Board cleared.');

    expect(selectBoard(useBoardStore.getState())).toEqual(createEmptyBoard());
    expect(useToastStore.getState().toasts).toEqual([
      expect.objectContaining({ message: 'Board cleared.', action: expect.any(Object) }),
    ]);
  });

  it('puts the previous board back when Undo runs', () => {
    const previousBoard = selectBoard(useBoardStore.getState());
    replaceBoardWithUndo(createEmptyBoard(), 'Board cleared.');

    useToastStore.getState().toasts[0]?.action?.onAction();

    expect(selectBoard(useBoardStore.getState())).toEqual(previousBoard);
  });
});
