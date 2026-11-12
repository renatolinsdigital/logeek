import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { collectConditions, createExampleBoard } from '@/domain/logic';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import { CardDeck } from '../CardDeck';

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
});

function getFirstConditionOf(cardName: string) {
  const card = screen.getByRole('article', { name: cardName });
  return {
    variable: within(card).getAllByRole('combobox', { name: 'Variable' })[0]!,
    operator: within(card).getAllByRole('combobox', { name: 'Operator' })[0]!,
    card,
  };
}

function getOptionLabels(select: HTMLElement): string[] {
  return within(select)
    .getAllByRole('option')
    .map((option) => option.textContent ?? '');
}

describe('ConditionRow', () => {
  it('offers the operators of the variable type, with symbols for numbers', () => {
    render(<CardDeck />);

    expect(getOptionLabels(getFirstConditionOf('Card 1: Turbo mode').operator)).toEqual([
      '>',
      '>=',
      '<',
      '<=',
      '=',
      '≠',
    ]);
  });

  it('switches to a text variable and offers its word operators, starting the value over', async () => {
    const user = userEvent.setup();
    render(<CardDeck />);
    const { variable, card } = getFirstConditionOf('Card 1: Turbo mode');

    await user.selectOptions(variable, 'country');

    const { operator } = getFirstConditionOf('Card 1: Turbo mode');
    expect(getOptionLabels(operator)).toEqual(['is', 'is not', 'contains']);
    expect(within(card).getAllByRole('textbox', { name: 'Value' })[0]).toHaveValue('');
  });

  it('changes the operator and marks a value that is not a number', async () => {
    const user = userEvent.setup();
    render(<CardDeck />);
    const { operator, card } = getFirstConditionOf('Card 1: Turbo mode');
    const valueField = within(card).getAllByRole('textbox', { name: 'Value' })[0]!;

    await user.selectOptions(operator, '<=');
    expect(valueField).toHaveAttribute('aria-invalid', 'false');
    await user.clear(valueField);
    await user.type(valueField, 'fast');

    expect(valueField).toHaveAttribute('aria-invalid', 'true');
    expect(collectConditions(useBoardStore.getState().cards[0]!.when)[0]).toMatchObject({
      operator: '<=',
      value: 'fast',
    });
  });

  it('picks true or false for a switch', async () => {
    const user = userEvent.setup();
    render(<CardDeck />);
    const bonusCard = screen.getByRole('article', { name: 'Card 3: Bonus round' });
    const switchValue = within(bonusCard).getByRole('combobox', { name: 'Value' });

    await user.selectOptions(switchValue, 'false');

    expect(switchValue).toHaveValue('false');
  });

  it('removes a condition', async () => {
    const user = userEvent.setup();
    render(<CardDeck />);
    const turboCard = screen.getByRole('article', { name: 'Card 1: Turbo mode' });

    await user.click(within(turboCard).getByRole('button', { name: 'Remove condition on speed' }));

    expect(within(turboCard).getAllByRole('combobox', { name: 'Variable' })).toHaveLength(1);
  });

  it('still offers removal for a condition whose variable is missing', () => {
    useBoardStore.setState({
      variables: [],
      cards: [
        {
          id: 'card_orphan',
          title: 'Orphan',
          color: 'pink',
          then: '',
          when: {
            id: 'group_root',
            kind: 'group',
            match: 'all',
            items: [
              {
                id: 'condition_orphan',
                kind: 'condition',
                variableId: 'variable_gone',
                operator: '==',
                value: 'x',
              },
            ],
          },
        },
      ],
    });
    render(<CardDeck />);

    expect(
      screen.getByRole('button', { name: 'Remove condition on missing variable' }),
    ).toBeInTheDocument();
  });
});
