import { beforeEach, describe, expect, it } from 'vitest';
import { collectConditions } from '@/domain/logic';
import { countVariableUses, createInitialBoardData, useBoardStore } from './useBoardStore';

function getState() {
  return useBoardStore.getState();
}

function getVariableId(name: string): string {
  const variable = getState().variables.find((candidate) => candidate.name === name);
  if (!variable) throw new Error(`no variable ${name}`);
  return variable.id;
}

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), lastRemovedCard: null });
});

describe('useBoardStore', () => {
  it('starts with the three example cards', () => {
    expect(getState().cards.map((card) => card.title)).toEqual([
      'Turbo mode',
      'Night league',
      'Bonus round',
    ]);
  });

  it('adds a card holding one condition on the first variable', () => {
    const newCardId = getState().addCard();

    const newCard = getState().cards.find((card) => card.id === newCardId);
    expect(newCard?.title).toBe('Card 4');
    expect(collectConditions(newCard!.when)).toHaveLength(1);
  });

  it('moves, duplicates and removes cards, and brings a removed one back', () => {
    const [firstCard, secondCard] = getState().cards;

    getState().moveCard(firstCard!.id, 1);
    expect(getState().cards[1]?.id).toBe(firstCard!.id);

    getState().duplicateCard(secondCard!.id);
    expect(getState().cards[1]?.title).toBe('Night league (copy)');

    getState().removeCard(firstCard!.id);
    expect(getState().cards.some((card) => card.id === firstCard!.id)).toBe(false);

    getState().restoreRemovedCard();
    expect(getState().cards[2]?.id).toBe(firstCard!.id);
  });

  it('resets the operator and value when a condition switches to another type', () => {
    const turboCard = getState().cards[0]!;
    const speedCondition = collectConditions(turboCard.when)[0]!;

    getState().updateCondition(turboCard.id, speedCondition.id, {
      variableId: getVariableId('country'),
    });

    const updatedCondition = collectConditions(getState().cards[0]!.when)[0];
    expect(updatedCondition).toMatchObject({ operator: '==', value: '' });
  });

  it('refuses to remove a variable a card still reads', () => {
    const speedId = getVariableId('speed');

    getState().removeVariable(speedId);

    expect(countVariableUses(getState().cards, speedId)).toBe(1);
    expect(getState().variables.some((variable) => variable.id === speedId)).toBe(true);
  });

  it('rewrites the conditions on a variable when its type changes', () => {
    const ageId = getVariableId('age');

    getState().changeVariableType(ageId, 'boolean');

    const ageCondition = collectConditions(getState().cards[1]!.when)[0];
    expect(ageCondition).toMatchObject({ operator: '==', value: 'true' });
  });
});
