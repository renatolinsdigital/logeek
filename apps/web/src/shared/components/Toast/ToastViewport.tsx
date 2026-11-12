import { useEffect } from 'react';
import { PixelIcon } from '../PixelIcon';
import { useToastStore, type ToastMessage } from './toastStore';
import styles from './ToastViewport.module.scss';

export interface ToastViewportProps {
  /** The accessible name of each toast's close button. */
  dismissLabel: string;
}

function ToastItem({ toast, dismissLabel }: { toast: ToastMessage; dismissLabel: string }) {
  const dismissToast = useToastStore((state) => state.dismissToast);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => dismissToast(toast.id), toast.durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [dismissToast, toast.id, toast.durationMs]);

  return (
    <li className={styles.toast}>
      <span className={styles.message}>{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            toast.action?.onAction();
            dismissToast(toast.id);
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        className={styles.dismiss}
        aria-label={dismissLabel}
        title={dismissLabel}
        onClick={() => dismissToast(toast.id)}
      >
        <PixelIcon name="close" size={10} />
      </button>
    </li>
  );
}

/** Where `showToast` messages appear. Render it once, near the root. */
function ToastViewport({ dismissLabel }: ToastViewportProps) {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <ol className={styles.viewport} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} dismissLabel={dismissLabel} />
      ))}
    </ol>
  );
}

export default ToastViewport;
