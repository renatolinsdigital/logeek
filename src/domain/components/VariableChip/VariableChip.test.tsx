import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastViewport, useToastStore } from '@/shared/components';
import { createExampleBoard } from '@/domain/logic';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import { VariablesPanel } from '../VariablesPanel';

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
  useToastStore.setState({ toasts: [] });
});

function renderPanel() {
  render(
    <>
      <VariablesPanel />
      <ToastViewport dismissLabel="Dismiss message" />
    </>,
  );
}

function getVariableNames(): string[] {
  return useBoardStore.getState().variables.map((variable) => variable.name);
}

describe('VariableChip', () => {
  it('renames a variable when its field loses focus', async () => {
    const user = userEvent.setup();
    renderPanel();
    const nameField = screen.getByRole('textbox', { name: 'Name of variable speed' });

    await user.clear(nameField);
    await user.type(nameField, ' velocity ');
    await user.tab();

    expect(getVariableNames()[0]).toBe('velocity');
    expect(screen.getByRole('textbox', { name: 'Name of variable velocity' })).toBeInTheDocument();
  });

  it('commits a new name with Enter', async () => {
    const user = userEvent.setup();
    renderPanel();
    const nameField = screen.getByRole('textbox', { name: 'Name of variable speed' });

    await user.clear(nameField);
    await user.type(nameField, 'pace{Enter}');

    expect(getVariableNames()[0]).toBe('pace');
    expect(nameField).not.toHaveFocus();
  });

  it('drops a half-typed name when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderPanel();
    const nameField = screen.getByRole('textbox', { name: 'Name of variable speed' });

    await user.clear(nameField);
    await user.type(nameField, 'tempo{Escape}');

    expect(getVariableNames()[0]).toBe('speed');
    expect(nameField).toHaveValue('speed');
    expect(nameField).not.toHaveFocus();
  });

  it('keeps the name when the field is left unchanged', async () => {
    const user = userEvent.setup();
    renderPanel();
    const variablesBefore = useBoardStore.getState().variables;

    await user.click(screen.getByRole('textbox', { name: 'Name of variable speed' }));
    await user.tab();

    expect(useBoardStore.getState().variables).toBe(variablesBefore);
  });

  it('refuses a name already taken, says why and keeps the old one', async () => {
    const user = userEvent.setup();
    renderPanel();
    const nameField = screen.getByRole('textbox', { name: 'Name of variable speed' });

    await user.clear(nameField);
    await user.type(nameField, 'Coins');
    await user.tab();

    expect(screen.getByText('There is already a variable called Coins.')).toBeInTheDocument();
    expect(nameField).toHaveValue('speed');
    expect(getVariableNames()[0]).toBe('speed');
  });

  it('says how many conditions a type change reset', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Type of speed' }), 'text');
    expect(screen.getByText('speed is now Text: its 1 condition was reset.')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Type of coins' }), 'boolean');
    expect(
      screen.getByText('coins is now True / False: its 2 conditions were reset.'),
    ).toBeInTheDocument();
  });

  it('changes the type of an unused variable without a message', async () => {
    const user = userEvent.setup();
    useBoardStore.getState().addVariable('spare', 'number');
    renderPanel();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Type of spare' }), 'text');

    expect(useBoardStore.getState().variables.at(-1)?.type).toBe('text');
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('shows how many conditions use a variable and removes only an unused one', async () => {
    const user = userEvent.setup();
    useBoardStore.getState().addVariable('spare', 'number');
    renderPanel();

    expect(screen.getByTitle('Used by 2 conditions')).toHaveTextContent('×2');
    expect(
      screen.getByRole('button', { name: 'speed is used by 1 condition: remove those first' }),
    ).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Remove spare' }));

    expect(getVariableNames()).not.toContain('spare');
  });
});
