import { beforeEach, describe, expect, it } from 'vitest';
import { CARD_COLORS, type ConditionGroup } from '@/domain/models';
import { collectConditions, countVariableUses, createExampleBoard } from '@/domain/logic';
import {
  createEmptyBoard,
  createInitialBoardData,
  selectBoard,
  useBoardStore,
} from './useBoardStore';

function getState() {
  return useBoardStore.getState();
}

function getVariableId(name: string): string {
  const variable = getState().variables.find((candidate) => candidate.name === name);
  if (!variable) throw new Error(`no variable ${name}`);
  return variable.id;
}

function getCard(cardIndex: number) {
  const card = getState().cards[cardIndex];
  if (!card) throw new Error(`no card at ${cardIndex}`);
  return card;
}

function getConditions(cardIndex: number) {
  return collectConditions(getCard(cardIndex).when);
}

function getNestedGroup(cardIndex: number): ConditionGroup {
  const nestedGroup = getCard(cardIndex).when.items.find((item) => item.kind === 'group');
  if (nestedGroup?.kind !== 'group') throw new Error(`card ${cardIndex} has no nested group`);
  return nestedGroup;
}

beforeEach(() => {
  useBoardStore.setState({
    ...createInitialBoardData(),
    ...createExampleBoard(),
    lastRemovedCard: null,
  });
});

describe('useBoardStore', () => {
  it('starts with an empty board, with no variables or cards', () => {
    expect(createInitialBoardData()).toEqual({
      ...createEmptyBoard(),
      jsonFormat: 'logeek',
      isJsonCompact: false,
    });
  });

  it('selects only the logic part of the state as the board', () => {
    expect(Object.keys(selectBoard(getState()))).toEqual(['variables', 'cards', 'otherwise']);
  });
});

describe('variables', () => {
  it('adds a variable with its type default as the test value', () => {
    getState().addVariable('lives', 'number');
    getState().addVariable('isVip', 'boolean');

    expect(getState().variables.slice(-2)).toMatchObject([
      { name: 'lives', type: 'number', sample: '0' },
      { name: 'isVip', type: 'boolean', sample: 'true' },
    ]);
  });

  it('renames a variable and sets its test value, leaving the others alone', () => {
    const speedId = getVariableId('speed');

    getState().renameVariable(speedId, 'velocity');
    getState().setVariableSample(speedId, '42');

    expect(getState().variables[0]).toMatchObject({ name: 'velocity', sample: '42' });
    expect(getState().variables[1]).toMatchObject({ name: 'coins', sample: '12' });
  });

  it('refuses to remove a variable a card still reads', () => {
    const speedId = getVariableId('speed');

    getState().removeVariable(speedId);

    expect(countVariableUses(getState().cards, speedId)).toBe(1);
    expect(getState().variables.some((variable) => variable.id === speedId)).toBe(true);
  });

  it('removes a variable no card reads', () => {
    getState().addVariable('unused', 'text');

    getState().removeVariable(getVariableId('unused'));

    expect(getState().variables.map((variable) => variable.name)).not.toContain('unused');
  });

  it('rewrites the conditions on a variable and its test value when its type changes', () => {
    const ageId = getVariableId('age');

    getState().changeVariableType(ageId, 'boolean');

    expect(getConditions(1)[0]).toMatchObject({ operator: '==', value: 'true' });
    expect(getState().variables.find((variable) => variable.id === ageId)).toMatchObject({
      type: 'boolean',
      sample: 'true',
    });
    expect(getConditions(0)[0]).toMatchObject({ operator: '>', value: '100' });
  });
});

describe('cards', () => {
  it('adds a card holding one condition on the first variable, coloured by its position', () => {
    const newCardId = getState().addCard();

    const newCard = getState().cards.find((card) => card.id === newCardId);
    expect(newCard?.title).toBe('Card 4');
    expect(newCard?.color).toBe(CARD_COLORS[3]);
    expect(collectConditions(newCard!.when)).toEqual([
      expect.objectContaining({ variableId: getVariableId('speed'), operator: '>', value: '0' }),
    ]);
  });

  it('adds a card with no conditions when there are no variables', () => {
    useBoardStore.setState({ ...createEmptyBoard() });

    getState().addCard();

    expect(getCard(0)).toMatchObject({ title: 'Card 1', color: 'pink', then: '' });
    expect(getCard(0).when).toMatchObject({ kind: 'group', match: 'all', items: [] });
  });

  it('updates the title and the answer of one card', () => {
    getState().updateCard(getCard(0).id, { title: 'Hyper mode', then: 'Go hyper' });

    expect(getCard(0)).toMatchObject({ title: 'Hyper mode', then: 'Go hyper' });
    expect(getCard(1).title).toBe('Night league');
  });

  it('cycles a card through the palette and back to the start', () => {
    const cardId = getCard(0).id;

    for (const expectedColor of [...CARD_COLORS.slice(1), CARD_COLORS[0]]) {
      getState().cycleCardColor(cardId);
      expect(getCard(0).color).toBe(expectedColor);
    }
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
    expect(getState().lastRemovedCard).toBeNull();
  });

  it('keeps the cards as they are when a move would leave the deck or the card is unknown', () => {
    const cardIds = getState().cards.map((card) => card.id);

    getState().moveCard(cardIds[0]!, -1);
    getState().moveCard(cardIds[2]!, 1);
    getState().moveCard('card_unknown', 1);
    getState().duplicateCard('card_unknown');
    getState().removeCard('card_unknown');

    expect(getState().cards.map((card) => card.id)).toEqual(cardIds);
    expect(getState().lastRemovedCard).toBeNull();
  });

  it('gives a duplicated card fresh ids for every node, with the same logic', () => {
    getState().duplicateCard(getCard(2).id);

    const [original, copy] = [getCard(2), getCard(3)];
    expect(copy.id).not.toBe(original.id);
    expect(copy.when.id).not.toBe(original.when.id);
    expect(collectConditions(copy.when).map((condition) => condition.id)).not.toEqual(
      collectConditions(original.when).map((condition) => condition.id),
    );
    expect(collectConditions(copy.when).map(({ id: _id, ...rest }) => rest)).toEqual(
      collectConditions(original.when).map(({ id: _id, ...rest }) => rest),
    );
  });

  it('does not bring back a removed card whose variable is gone meanwhile', () => {
    const turboCard = getCard(0);
    getState().removeCard(turboCard.id);
    getState().removeVariable(getVariableId('speed'));

    getState().restoreRemovedCard();

    expect(getState().cards.some((card) => card.id === turboCard.id)).toBe(false);
    expect(getState().lastRemovedCard).toBeNull();
  });

  it('does nothing on restore when no card was removed', () => {
    const cardsBefore = getState().cards;

    getState().restoreRemovedCard();

    expect(getState().cards).toBe(cardsBefore);
  });
});

describe('conditions and groups', () => {
  it('adds a condition on the first variable to the root and to a nested group', () => {
    const bonusCardId = getCard(2).id;

    getState().addCondition(bonusCardId, getCard(2).when.id);
    getState().addCondition(bonusCardId, getNestedGroup(2).id);

    expect(getCard(2).when.items).toHaveLength(3);
    expect(getNestedGroup(2).items).toHaveLength(3);
    expect(getNestedGroup(2).items[2]).toMatchObject({ variableId: getVariableId('speed') });
  });

  it('adds no condition while there are no variables', () => {
    useBoardStore.setState({ variables: [] });
    const rootGroupBefore = getCard(0).when;

    getState().addCondition(getCard(0).id, rootGroupBefore.id);

    expect(getCard(0).when).toBe(rootGroupBefore);
  });

  it('adds an any group holding one condition to the root', () => {
    getState().addGroup(getCard(1).id);

    const newGroup = getCard(1).when.items[1];
    expect(newGroup).toMatchObject({ kind: 'group', match: 'any' });
    expect(newGroup?.kind === 'group' && newGroup.items).toHaveLength(1);
  });

  it('resets the operator and value when a condition switches to another type', () => {
    const speedCondition = getConditions(0)[0]!;

    getState().updateCondition(getCard(0).id, speedCondition.id, {
      variableId: getVariableId('country'),
    });

    expect(getConditions(0)[0]).toMatchObject({ operator: '==', value: '' });
  });

  it('keeps the value when a condition switches to a variable of the same type', () => {
    const speedCondition = getConditions(0)[0]!;

    getState().updateCondition(getCard(0).id, speedCondition.id, {
      variableId: getVariableId('age'),
    });

    expect(getConditions(0)[0]).toMatchObject({
      variableId: getVariableId('age'),
      operator: '>',
      value: '100',
    });
  });

  it('updates the operator and the value of a condition', () => {
    const speedCondition = getConditions(0)[0]!;

    getState().updateCondition(getCard(0).id, speedCondition.id, { operator: '<=', value: '7' });

    expect(getConditions(0)[0]).toMatchObject({ operator: '<=', value: '7' });
  });

  it('ignores a condition update that points at a missing variable or at a group', () => {
    const speedCondition = getConditions(0)[0]!;

    getState().updateCondition(getCard(0).id, speedCondition.id, { variableId: 'variable_gone' });
    getState().updateCondition(getCard(2).id, getNestedGroup(2).id, { value: 'x' });

    expect(getConditions(0)[0]).toEqual(speedCondition);
    expect(getNestedGroup(2)).not.toHaveProperty('value');
  });

  it('switches a group between all and any, and leaves a condition alone', () => {
    const speedCondition = getConditions(0)[0]!;

    getState().setGroupMatch(getCard(2).id, getNestedGroup(2).id, 'any');
    getState().setGroupMatch(getCard(0).id, speedCondition.id, 'any');

    expect(getNestedGroup(2).match).toBe('any');
    expect(getConditions(0)[0]).toEqual(speedCondition);
  });

  it('removes a nested group with everything inside it', () => {
    getState().removeNode(getCard(2).id, getNestedGroup(2).id);

    expect(getCard(2).when.items).toHaveLength(1);
    expect(getConditions(2)).toHaveLength(1);
  });
});

describe('board settings', () => {
  it('sets the fallback answer and the JSON view settings', () => {
    getState().setOtherwise('Game over');
    getState().setJsonFormat('jsonlogic');
    getState().setJsonCompact(true);

    expect(getState()).toMatchObject({
      otherwise: 'Game over',
      jsonFormat: 'jsonlogic',
      isJsonCompact: true,
    });
  });

  it('loads a whole board and forgets the last removed card', () => {
    getState().removeCard(getCard(0).id);

    getState().loadBoard(createEmptyBoard());

    expect(selectBoard(getState())).toEqual(createEmptyBoard());
    expect(getState().lastRemovedCard).toBeNull();
  });
});

describe('persistence', () => {
  function saveToStorage(state: unknown): void {
    window.localStorage.setItem('logeek-board', JSON.stringify({ state, version: 1 }));
  }

  it('saves the board and the JSON settings, but not the undo slot', () => {
    getState().setOtherwise('Saved');
    getState().removeCard(getCard(0).id);

    const savedState = JSON.parse(window.localStorage.getItem('logeek-board') ?? '{}').state;

    expect(Object.keys(savedState).sort()).toEqual(
      ['cards', 'isJsonCompact', 'jsonFormat', 'otherwise', 'variables'].sort(),
    );
    expect(savedState.otherwise).toBe('Saved');
  });

  it('restores a saved board through the board check, with fresh ids', async () => {
    const savedBoard = createExampleBoard();
    // Any state change saves itself, so the store is emptied before the save is planted.
    useBoardStore.setState({ ...createInitialBoardData() });
    saveToStorage({ ...savedBoard, jsonFormat: 'jsonlogic', isJsonCompact: true });

    await useBoardStore.persist.rehydrate();

    expect(getState().cards.map((card) => card.title)).toEqual(
      savedBoard.cards.map((card) => card.title),
    );
    expect(getState().cards[0]?.id).not.toBe(savedBoard.cards[0]?.id);
    expect(getState()).toMatchObject({ jsonFormat: 'jsonlogic', isJsonCompact: true });
  });

  it('reads unknown JSON settings as the defaults', async () => {
    saveToStorage({ ...createExampleBoard(), jsonFormat: 'yaml', isJsonCompact: 'yes' });

    await useBoardStore.persist.rehydrate();

    expect(getState()).toMatchObject({ jsonFormat: 'logeek', isJsonCompact: false });
  });

  it('keeps the current board when the saved one does not pass the check', async () => {
    saveToStorage({ variables: 'broken', cards: [], otherwise: '' });
    const cardsBefore = getState().cards;

    await useBoardStore.persist.rehydrate();

    expect(getState().cards).toBe(cardsBefore);
  });
});
