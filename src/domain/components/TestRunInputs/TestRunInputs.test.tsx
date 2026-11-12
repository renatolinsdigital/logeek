import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createExampleBoard } from '@/domain/logic';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import TestRunInputs from './TestRunInputs';

function ConnectedTestRunInputs() {
  const variables = useBoardStore((state) => state.variables);
  return <TestRunInputs variables={variables} />;
}

function getSample(name: string): string | undefined {
  return useBoardStore.getState().variables.find((variable) => variable.name === name)?.sample;
}

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
});

describe('TestRunInputs', () => {
  it('asks for a variable while there is none', () => {
    render(<TestRunInputs variables={[]} />);

    expect(
      screen.getByText('Add a variable to give the test run something to try.'),
    ).toBeInTheDocument();
  });

  it('gives every variable a field named after it', () => {
    render(<ConnectedTestRunInputs />);
    const fields = screen.getByRole('group', { name: 'Test values' });

    expect(within(fields).getByRole('textbox', { name: 'speed' })).toHaveValue('80');
    expect(within(fields).getByRole('textbox', { name: 'country' })).toHaveValue('BR');
    expect(within(fields).getByRole('group', { name: 'hasTicket' })).toBeInTheDocument();
  });

  it('flips a switch between true and false', async () => {
    const user = userEvent.setup();
    render(<ConnectedTestRunInputs />);
    const hasTicket = screen.getByRole('group', { name: 'hasTicket' });

    expect(within(hasTicket).getByRole('button', { name: 'False' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(within(hasTicket).getByRole('button', { name: 'True' }));

    expect(getSample('hasTicket')).toBe('true');
    expect(within(hasTicket).getByRole('button', { name: 'True' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps a number as typed and marks one it cannot read', async () => {
    const user = userEvent.setup();
    render(<ConnectedTestRunInputs />);
    const speedField = screen.getByRole('textbox', { name: 'speed' });

    await user.clear(speedField);

    expect(speedField).toHaveAttribute('aria-invalid', 'true');
    await user.type(speedField, '1.');
    expect(getSample('speed')).toBe('1.');
    expect(speedField).toHaveAttribute('aria-invalid', 'false');
  });
});
