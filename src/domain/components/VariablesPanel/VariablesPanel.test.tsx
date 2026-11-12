import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import VariablesPanel from './VariablesPanel';

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData() });
});

describe('VariablesPanel', () => {
  it('invites the first variable while there is none', () => {
    render(<VariablesPanel />);

    expect(screen.getByText('No variables yet. Add the first one below.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Variables' })).not.toBeInTheDocument();
  });

  it('adds a trimmed variable of the chosen type and clears the field', async () => {
    const user = userEvent.setup();
    render(<VariablesPanel />);

    await user.type(screen.getByLabelText('New variable'), '  isMember ');
    await user.selectOptions(screen.getByLabelText('Type'), 'boolean');
    await user.click(screen.getByRole('button', { name: 'Add variable' }));

    expect(useBoardStore.getState().variables).toEqual([
      expect.objectContaining({ name: 'isMember', type: 'boolean', sample: 'true' }),
    ]);
    expect(screen.getByLabelText('New variable')).toHaveValue('');
  });

  it('says why a name is refused and forgets the error once the name changes', async () => {
    const user = userEvent.setup();
    render(<VariablesPanel />);
    const nameField = screen.getByLabelText('New variable');

    await user.click(screen.getByRole('button', { name: 'Add variable' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Give the variable a name.');
    expect(nameField).toHaveAccessibleDescription('Give the variable a name.');

    await user.type(nameField, 'x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(nameField).toHaveAttribute('aria-invalid', 'false');
  });
});
