import { describe, expect, it } from 'vitest';
import type { Board } from '@/domain/models';
import { buildVariableLookup } from './evaluate';
import { describeGroup, describeGroupLines } from './describe';
import { createExampleBoard } from './examples';
import { formatBoardJson, toJsonLogic, toLogeekJson } from './exportJson';

describe('toLogeekJson', () => {
  it('writes variables by name and cards as decisions in order', () => {
    const document = toLogeekJson(createExampleBoard());

    expect(document.variables).toEqual({
      speed: 'number',
      coins: 'number',
      age: 'number',
      hasTicket: 'boolean',
      country: 'text',
    });
    expect(document.decisions.map((decision) => decision.name)).toEqual([
      'Turbo mode',
      'Night league',
      'Bonus round',
    ]);
    expect(document.decisions[0]?.if).toEqual({
      all: [
        { variable: 'speed', operator: '>', value: 100 },
        { variable: 'coins', operator: '>=', value: 3 },
      ],
    });
    expect(document.otherwise).toBe('Insert coin to continue');
  });

  it('types values by their variable and nests groups', () => {
    const bonusDecision = toLogeekJson(createExampleBoard()).decisions[2];

    expect(bonusDecision?.if).toEqual({
      any: [
        { variable: 'hasTicket', operator: '==', value: true },
        {
          all: [
            { variable: 'country', operator: '==', value: 'BR' },
            { variable: 'coins', operator: '>', value: 10 },
          ],
        },
      ],
    });
  });
});

describe('toJsonLogic', () => {
  it('chains the cards into one if rule ending with otherwise', () => {
    const rule = toJsonLogic(createExampleBoard());

    expect(rule).toEqual({
      if: [
        { and: [{ '>': [{ var: 'speed' }, 100] }, { '>=': [{ var: 'coins' }, 3] }] },
        'Unlock the turbo boost',
        { and: [{ '>=': [{ var: 'age' }, 18] }] },
        'Join the night league',
        {
          or: [
            { '==': [{ var: 'hasTicket' }, true] },
            { and: [{ '==': [{ var: 'country' }, 'BR'] }, { '>': [{ var: 'coins' }, 10] }] },
          ],
        },
        'Play a bonus round',
        'Insert coin to continue',
      ],
    });
  });

  it('writes contains as in, and an empty board as its fallback', () => {
    const board: Board = {
      variables: [{ id: 'v1', name: 'path', type: 'text', sample: '' }],
      otherwise: 'stay',
      cards: [
        {
          id: 'c1',
          title: 'Checkout',
          color: 'pink',
          then: 'hide',
          when: {
            id: 'g1',
            kind: 'group',
            match: 'all',
            items: [
              {
                id: 'k1',
                kind: 'condition',
                variableId: 'v1',
                operator: 'contains',
                value: 'cart',
              },
            ],
          },
        },
      ],
    };

    expect(toJsonLogic(board)).toEqual({
      if: [{ and: [{ in: ['cart', { var: 'path' }] }] }, 'hide', 'stay'],
    });
    expect(toJsonLogic({ ...board, cards: [] })).toBe('stay');
  });
});

describe('formatBoardJson', () => {
  it('prints compact JSON on one line', () => {
    expect(formatBoardJson(createExampleBoard(), 'logeek', true)).not.toContain('\n');
    expect(formatBoardJson(createExampleBoard(), 'logeek', false)).toContain('\n  ');
  });
});

describe('describeGroup', () => {
  it('reads a card as a person would say it', () => {
    const board = createExampleBoard();
    const variableLookup = buildVariableLookup(board.variables);
    const bonusCard = board.cards[2];
    if (!bonusCard) throw new Error('the example board has three cards');

    expect(describeGroup(bonusCard.when, variableLookup)).toBe(
      'hasTicket is true OR (country is "BR" AND coins > 10)',
    );
    expect(describeGroupLines(bonusCard.when, variableLookup)).toEqual([
      'hasTicket is true',
      'OR (country is "BR" AND coins > 10)',
    ]);
  });
});
