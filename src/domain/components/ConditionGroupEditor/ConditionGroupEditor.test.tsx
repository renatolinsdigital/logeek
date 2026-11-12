import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createExampleBoard } from '@/domain/logic';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import { CardDeck } from '../CardDeck';

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
});

function getCard(name: string): HTMLElement {
  return screen.getByRole('article', { name });
}

function countConditions(card: HTMLElement): number {
  return within(card).queryAllByRole('combobox', { name: 'Variable' }).length;
}

describe('ConditionGroupEditor', () => {
  it('adds a condition and a group to a card', async () => {
    const user = userEvent.setup();
    render(<CardDeck />);
    const nightCard = getCard('Card 2: Night league');

    await user.click(within(nightCard).getByRole('button', { name: 'Condition' }));
    expect(countConditions(nightCard)).toBe(2);

    await user.click(within(nightCard).getByRole('button', { name: 'Group' }));
    expect(countConditions(nightCard)).toBe(3);
    expect(within(nightCard).getByRole('button', { name: 'Remove group' })).toBeInTheDocument();
  });

  it('offers a new group only on the card itself, not inside a group', () => {
    render(<CardDeck />);

    expect(
      within(getCard('Card 3: Bonus round')).getAllByRole('button', { name: 'Group' }),
    ).toHaveLength(1);
    expect(
      within(getCard('Card 3: Bonus round')).getAllByRole('button', { name: 'Condition' }),
    ).toHaveLength(2);
  });

  it('switches the card and a nested group between all and any', async () => {
    const user = userEvent.setup();
    render(<CardDeck />);
    const bonusCard = getCard('Card 3: Bonus round');
    const cardMatch = within(bonusCard).getByRole('group', { name: 'Card conditions must match' });
    const groupMatch = within(bonusCard).getByRole('group', {
      name: 'Group conditions must match',
    });

    expect(within(cardMatch).getByRole('button', { name: 'Any' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(within(cardMatch).getByRole('button', { name: 'All' }));
    await user.click(within(groupMatch).getByRole('button', { name: 'Any' }));

    const bonusRoot = useBoardStore.getState().cards[2]!.when;
    expect(bonusRoot.match).toBe('all');
    expect(bonusRoot.items[1]).toMatchObject({ kind: 'group', match: 'any' });
  });

  it('removes a nested group with its conditions', async () => {
    const user = userEvent.setup();
    render(<CardDeck />);
    const bonusCard = getCard('Card 3: Bonus round');

    await user.click(within(bonusCard).getByRole('button', { name: 'Remove group' }));

    expect(countConditions(bonusCard)).toBe(1);
  });

  it('explains what an empty card and an empty group do', async () => {
    const user = userEvent.setup();
    render(<CardDeck />);
    const nightCard = getCard('Card 2: Night league');
    const bonusCard = getCard('Card 3: Bonus round');

    await user.click(within(nightCard).getByRole('button', { name: 'Remove condition on age' }));
    expect(nightCard).toHaveTextContent('No conditions: this card always passes.');

    await user.click(
      within(bonusCard).getByRole('button', { name: 'Remove condition on country' }),
    );
    await user.click(within(bonusCard).getByRole('button', { name: 'Remove condition on coins' }));
    expect(bonusCard).toHaveTextContent('Empty group: always passes.');

    const groupMatch = within(bonusCard).getByRole('group', {
      name: 'Group conditions must match',
    });
    await user.click(within(groupMatch).getByRole('button', { name: 'Any' }));
    expect(bonusCard).toHaveTextContent('Empty group: never passes.');
  });

  it('cannot add conditions or groups before there is a variable', () => {
    useBoardStore.setState({
      variables: [],
      cards: [
        {
          id: 'card_empty',
          title: 'Empty',
          color: 'pink',
          then: '',
          when: { id: 'group_root', kind: 'group', match: 'all', items: [] },
        },
      ],
    });
    render(<CardDeck />);

    const conditionButton = screen.getByRole('button', { name: 'Condition' });
    expect(conditionButton).toBeDisabled();
    expect(conditionButton).toHaveAttribute('title', 'Create a variable first');
    expect(screen.getByRole('button', { name: 'Group' })).toBeDisabled();
  });
});
