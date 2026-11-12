import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from '@/shared/components';
import { createExampleBoard, formatBoardJson } from '@/domain/logic';
import { createInitialBoardData, selectBoard, useBoardStore } from '@/domain/store';
import JsonExport from './JsonExport';

function getToastMessages(): string[] {
  return useToastStore.getState().toasts.map((toast) => toast.message);
}

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
  useToastStore.setState({ toasts: [] });
});

const { createObjectURL, revokeObjectURL } = URL;

afterEach(() => {
  vi.restoreAllMocks();
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;
});

describe('JsonExport', () => {
  it('explains the chosen format and switches between pretty and compact', async () => {
    const user = userEvent.setup();
    render(<JsonExport />);
    expect(screen.getByText(/decisions run top to bottom/)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Board as logeek JSON' }).textContent).toContain(
      '\n',
    );

    await user.click(screen.getByRole('button', { name: 'Compact' }));
    await user.click(screen.getByRole('button', { name: 'JsonLogic' }));

    expect(screen.getByText(/run it with any JsonLogic library/)).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Board as jsonlogic JSON' }).textContent,
    ).not.toContain('\n');
    expect(useBoardStore.getState()).toMatchObject({
      jsonFormat: 'jsonlogic',
      isJsonCompact: true,
    });
  });

  it('copies the JSON shown to the clipboard', async () => {
    const user = userEvent.setup();
    render(<JsonExport />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await expect(navigator.clipboard.readText()).resolves.toBe(
      formatBoardJson(selectBoard(useBoardStore.getState()), 'logeek', false),
    );
    expect(getToastMessages()).toEqual(['JSON copied to the clipboard.']);
  });

  it('says how to copy by hand when the browser blocks the clipboard', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    render(<JsonExport />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(getToastMessages()).toEqual([
      'The browser blocked the clipboard. Select the JSON and copy it by hand.',
    ]);
  });

  it('downloads the JSON in a file named after its format', async () => {
    const user = userEvent.setup();
    const downloadedFileNames: string[] = [];
    // jsdom has no object URLs, and clicking a download link would try to navigate.
    URL.createObjectURL = vi.fn(() => 'blob:logeek');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function recordDownload(
      this: HTMLAnchorElement,
    ) {
      downloadedFileNames.push(this.download);
    });
    render(<JsonExport />);

    await user.click(screen.getByRole('button', { name: 'Download' }));
    await user.click(screen.getByRole('button', { name: 'JsonLogic' }));
    await user.click(screen.getByRole('button', { name: 'Download' }));

    expect(downloadedFileNames).toEqual(['logeek-board.json', 'logeek-jsonlogic.json']);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:logeek');
  });
});
