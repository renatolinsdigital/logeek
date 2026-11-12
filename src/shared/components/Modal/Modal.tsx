import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { classNames } from '@/lib/classNames';
import { Button } from '../Button';
import styles from './Modal.module.scss';

export interface ModalProps {
  title: string;
  /** The close button shows only an icon, so this names it for screen readers. */
  closeLabel: string;
  onClose: () => void;
  /** Extra class on the dialog. Setting `--modal-shadow-color` there recolours the offset shadow. */
  className?: string;
  children: ReactNode;
}

/**
 * A modal dialog on the native `<dialog>`: the page behind goes inert, focus
 * stays inside and Escape closes it. It is open while mounted, so the caller
 * renders it conditionally and its contents start fresh every time.
 */
function Modal({ title, closeLabel, onClose, className, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Focus goes back to whatever opened the dialog, however it closes. The
  // layout effect's cleanup runs while the opener is still in the page.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const openerElement = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (openerElement instanceof HTMLElement && openerElement.isConnected) openerElement.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={classNames(styles.modal, className)}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // The caller decides when the dialog goes, by unmounting it.
        event.preventDefault();
        onClose();
      }}
    >
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <Button variant="ghost" size="sm" icon="close" label={closeLabel} onClick={onClose} />
      </header>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}

export default Modal;
