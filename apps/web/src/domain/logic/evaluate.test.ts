import { describe, expect, it } from 'vitest';
import type { Board, Condition, Variable } from '@/domain/models';
import { buildVariableLookup, evaluateCondition, runBoard } from './evaluate';
import { createExampleBoard } from './examples';

function makeVariable(type: Variable['type'], sample: string): Variable {
  return { id: 'variable_1', name: 'subject', type, sample };
}

function makeCondition(operator: Condition['operator'], value: string): Condition {
  return { id: 'condition_1', kind: 'condition', variableId: 'variable_1', operator, value };
}

function check(variable: Variable, condition: Condition): boolean {
  return evaluateCondition(condition, buildVariableLookup([variable]));
}

describe('evaluateCondition', () => {
  it('compares numbers with every number operator', () => {
    const speed = makeVariable('number', '120');

    expect(check(speed, makeCondition('>', '100'))).toBe(true);
    expect(check(speed, makeCondition('>=', '120'))).toBe(true);
    expect(check(speed, makeCondition('<', '100'))).toBe(false);
    expect(check(speed, makeCondition('<=', '119.5'))).toBe(false);
    expect(check(speed, makeCondition('==', '120'))).toBe(true);
    expect(check(speed, makeCondition('!=', '120'))).toBe(false);
  });

  it('never passes when a number cannot be read', () => {
    expect(check(makeVariable('number', ''), makeCondition('<', '5'))).toBe(false);
    expect(check(makeVariable('number', '3'), makeCondition('<', 'five'))).toBe(false);
  });

  it('compares text exactly and by contains', () => {
    const country = makeVariable('text', 'Brazil');

    expect(check(country, makeCondition('==', 'Brazil'))).toBe(true);
    expect(check(country, makeCondition('==', 'brazil'))).toBe(false);
    expect(check(country, makeCondition('contains', 'raz'))).toBe(true);
    expect(check(country, makeCondition('!=', 'Chile'))).toBe(true);
  });

  it('compares true and false switches', () => {
    const hasTicket = makeVariable('boolean', 'false');

    expect(check(hasTicket, makeCondition('==', 'false'))).toBe(true);
    expect(check(hasTicket, makeCondition('!=', 'false'))).toBe(false);
  });

  it('never passes when the variable is gone', () => {
    expect(evaluateCondition(makeCondition('==', '1'), buildVariableLookup([]))).toBe(false);
  });
});

describe('runBoard', () => {
  it('walks the example cards and stops at the first match', () => {
    const board = createExampleBoard();
    const [turboCard, nightCard] = board.cards;

    const run = runBoard(board);

    expect(run.steps).toEqual([
      { cardId: turboCard?.id, isMatch: false },
      { cardId: nightCard?.id, isMatch: true },
    ]);
    expect(run.outcome).toBe('Join the night league');
  });

  it('answers with otherwise when no card matches', () => {
    const board: Board = { ...createExampleBoard(), cards: [] };

    expect(runBoard(board)).toEqual({ steps: [], matchedCardId: null, outcome: board.otherwise });
  });

  it('passes an empty all group and fails an empty any group', () => {
    const board: Board = {
      variables: [],
      otherwise: 'fallback',
      cards: [
        {
          id: 'card_any',
          title: 'Empty any',
          color: 'pink',
          then: 'never',
          when: { id: 'g1', kind: 'group', match: 'any', items: [] },
        },
        {
          id: 'card_all',
          title: 'Empty all',
          color: 'cyan',
          then: 'always',
          when: { id: 'g2', kind: 'group', match: 'all', items: [] },
        },
      ],
    };

    expect(runBoard(board).matchedCardId).toBe('card_all');
  });
});
