import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

function ModalOpener() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open
      </button>
      {isOpen && (
        <Modal title="Settings" closeLabel="Close settings" onClose={() => setIsOpen(false)}>
          <p>Inside</p>
        </Modal>
      )}
    </>
  );
}

describe('Modal', () => {
  it('opens as a dialog named by its title, holding its contents', () => {
    render(
      <Modal title="Settings" closeLabel="Close settings" onClose={() => {}}>
        <p>Inside</p>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveTextContent('Inside');
  });

  it('asks the caller to close on Escape instead of closing itself', () => {
    const handleClose = vi.fn();
    render(
      <Modal title="Settings" closeLabel="Close settings" onClose={handleClose}>
        <p>Inside</p>
      </Modal>,
    );
    const cancelEvent = new Event('cancel', { cancelable: true });

    fireEvent(screen.getByRole('dialog'), cancelEvent);

    expect(handleClose).toHaveBeenCalledOnce();
    expect(cancelEvent.defaultPrevented).toBe(true);
  });

  it('gives focus back to the button that opened it once it closes', async () => {
    const user = userEvent.setup();
    render(<ModalOpener />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close settings' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });
});
