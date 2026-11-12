import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { showToast, useToastStore } from './toastStore';
import ToastViewport from './ToastViewport';

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderViewport() {
  render(<ToastViewport dismissLabel="Dismiss message" />);
}

describe('ToastViewport', () => {
  it('announces messages politely and lets each one go after its time', () => {
    renderViewport();

    act(() => showToast('Saved.'));
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Saved.')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2999));
    expect(screen.getByText('Saved.')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText('Saved.')).not.toBeInTheDocument();
  });

  it('runs the action and closes the toast', () => {
    const handleUndo = vi.fn();
    renderViewport();
    act(() => showToast('Removed.', { action: { label: 'Undo', onAction: handleUndo } }));

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(handleUndo).toHaveBeenCalledOnce();
    expect(screen.queryByText('Removed.')).not.toBeInTheDocument();
  });

  it('closes a toast from its dismiss button, named by the label it was given', () => {
    renderViewport();
    act(() => showToast('Saved.'));

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss message' }));

    expect(screen.queryByText('Saved.')).not.toBeInTheDocument();
  });
});
