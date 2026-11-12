import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastViewport, useToastStore } from '@/shared/components';
import { createExampleBoard } from '@/domain/logic';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import CardDeck from './CardDeck';

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
  useToastStore.setState({ toasts: [] });
});

function renderDeck() {
  render(
    <>
      <CardDeck />
      <ToastViewport dismissLabel="Dismiss message" />
    </>,
  );
}

function getCardNames(): string[] {
  return screen.getAllByRole('article').map((card) => card.getAttribute('aria-label') ?? '');
}

describe('CardDeck', () => {
  it('cannot move the first card earlier or the last card later', () => {
    renderDeck();
    const cards = screen.getAllByRole('article');

    expect(
      within(cards[0]!).getByRole('button', { name: 'Check this card earlier' }),
    ).toBeDisabled();
    expect(within(cards[0]!).getByRole('button', { name: 'Check this card later' })).toBeEnabled();
    expect(within(cards[2]!).getByRole('button', { name: 'Check this card later' })).toBeDisabled();
  });

  it('moves a card later and back earlier', async () => {
    const user = userEvent.setup();
    renderDeck();

    await user.click(
      within(screen.getAllByRole('article')[0]!).getByRole('button', {
        name: 'Check this card later',
      }),
    );
    expect(getCardNames().slice(0, 2)).toEqual(['Card 1: Night league', 'Card 2: Turbo mode']);

    await user.click(
      within(screen.getAllByRole('article')[1]!).getByRole('button', {
        name: 'Check this card earlier',
      }),
    );
    expect(getCardNames().slice(0, 2)).toEqual(['Card 1: Turbo mode', 'Card 2: Night league']);
  });

  it('changes a card colour and duplicates a card below itself', async () => {
    const user = userEvent.setup();
    renderDeck();
    const turboCard = screen.getByRole('article', { name: 'Card 1: Turbo mode' });

    await user.click(within(turboCard).getByRole('button', { name: 'Change colour' }));
    expect(turboCard).toHaveAttribute('data-color', 'cyan');

    await user.click(within(turboCard).getByRole('button', { name: 'Duplicate card' }));
    expect(getCardNames()[1]).toBe('Card 2: Turbo mode (copy)');
  });

  it('names a card by its title, or as untitled while it has none', async () => {
    const user = userEvent.setup();
    renderDeck();
    const titleField = screen.getByRole('textbox', { name: 'Title of card 1' });

    await user.clear(titleField);
    expect(getCardNames()[0]).toBe('Card 1: Untitled card');

    await user.type(titleField, 'Hyper mode');
    expect(getCardNames()[0]).toBe('Card 1: Hyper mode');
  });

  it('edits the answer of a card and the fallback answer', async () => {
    const user = userEvent.setup();
    renderDeck();
    const turboCard = screen.getByRole('article', { name: 'Card 1: Turbo mode' });

    await user.clear(within(turboCard).getByLabelText('Then'));
    await user.type(within(turboCard).getByLabelText('Then'), 'Go fast');
    await user.clear(screen.getByLabelText('Otherwise'));
    await user.type(screen.getByLabelText('Otherwise'), 'Game over');

    expect(useBoardStore.getState().cards[0]?.then).toBe('Go fast');
    expect(useBoardStore.getState().otherwise).toBe('Game over');
  });

  it('says on each card what the test run did with it', () => {
    renderDeck();
    const [turboCard, nightCard, bonusCard] = screen.getAllByRole('article');

    expect(turboCard).toHaveTextContent('Test run: does not pass');
    expect(nightCard).toHaveTextContent('Test run: passes, this card answers');
    expect(bonusCard).toHaveTextContent('Test run: not reached');
  });

  it('names the removed card in the toast', async () => {
    const user = userEvent.setup();
    renderDeck();

    await user.click(
      within(screen.getByRole('article', { name: 'Card 2: Night league' })).getByRole('button', {
        name: 'Remove card',
      }),
    );

    expect(screen.getByText('Card "Night league" removed.')).toBeInTheDocument();
  });
});
