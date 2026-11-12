import { create } from 'zustand';

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface ToastMessage {
  id: number;
  message: string;
  action?: ToastAction;
  durationMs: number;
}

interface ToastState {
  toasts: ToastMessage[];
  dismissToast: (toastId: number) => void;
}

let nextToastId = 1;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  dismissToast: (toastId) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== toastId) })),
}));

const MAX_VISIBLE_TOASTS = 3;

/** Shows a short message at the bottom of the screen, with an optional action such as Undo. */
export function showToast(
  message: string,
  options: { action?: ToastAction; durationMs?: number } = {},
): void {
  const toast: ToastMessage = {
    id: nextToastId++,
    message,
    action: options.action,
    durationMs: options.durationMs ?? (options.action ? 6000 : 3000),
  };
  useToastStore.setState((state) => ({
    toasts: [...state.toasts, toast].slice(-MAX_VISIBLE_TOASTS),
  }));
}
