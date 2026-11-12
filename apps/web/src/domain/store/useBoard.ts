import { useShallow } from 'zustand/react/shallow';
import type { Board } from '@/domain/models';
import { selectBoard, useBoardStore } from './useBoardStore';

/** The variables, cards and fallback, re-rendering only when one of them changes. */
export function useBoard(): Board {
  return useBoardStore(useShallow(selectBoard));
}
