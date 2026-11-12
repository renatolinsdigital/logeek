import { describe, expect, it } from 'vitest';
import type { Board } from '@/domain/models';
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

describe('unreadable conditions', () => {
  const board: Board = {
    variables: [{ id: 'v1', name: 'speed', type: 'number', sample: '' }],
    otherwise: 'stay',
    cards: [
      {
        id: 'c1',
        title: 'Odd',
        color: 'pink',
        then: 'go',
        when: {
          id: 'g1',
          kind: 'group',
          match: 'any',
          items: [
            { id: 'k1', kind: 'condition', variableId: 'v1', operator: '>', value: 'fast' },
            { id: 'k2', kind: 'condition', variableId: 'v_gone', operator: '>', value: '1' },
            { id: 'g2', kind: 'group', match: 'all', items: [] },
            { id: 'g3', kind: 'group', match: 'any', items: [] },
          ],
        },
      },
    ],
  };

  it('exports an unreadable value as null and a missing variable with no name', () => {
    expect(toLogeekJson(board).decisions[0]?.if).toEqual({
      any: [
        { variable: 'speed', operator: '>', value: null },
        { variable: '', operator: '>', value: null },
        { all: [] },
        { any: [] },
      ],
    });
  });

  it('writes empty groups as true for all and false for any in JsonLogic', () => {
    expect(toJsonLogic(board)).toEqual({
      if: [
        {
          or: [{ '>': [{ var: 'speed' }, null] }, { '>': [{ var: '' }, null] }, true, false],
        },
        'go',
        'stay',
      ],
    });
  });
});

describe('formatBoardJson', () => {
  it('prints compact JSON on one line', () => {
    expect(formatBoardJson(createExampleBoard(), 'logeek', true)).not.toContain('\n');
    expect(formatBoardJson(createExampleBoard(), 'logeek', false)).toContain('\n  ');
  });

  it('prints the chosen format', () => {
    const board = createExampleBoard();

    expect(JSON.parse(formatBoardJson(board, 'jsonlogic', true))).toEqual(toJsonLogic(board));
    expect(JSON.parse(formatBoardJson(board, 'logeek', true))).toEqual(toLogeekJson(board));
  });
});
