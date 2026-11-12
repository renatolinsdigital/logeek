import { describe, expect, it } from 'vitest';
import type { Condition, ConditionGroup, LogicCard, Variable } from '@/domain/models';
import {
  describeAnswer,
  describeCardTitle,
  describeCondition,
  describeGroup,
  describeGroupLines,
  getJoinWord,
} from './describe';
import { buildVariableLookup } from './evaluate';
import { createExampleBoard } from './examples';

const variables: Variable[] = [
  { id: 'v_speed', name: 'speed', type: 'number', sample: '' },
  { id: 'v_country', name: 'country', type: 'text', sample: '' },
  { id: 'v_ticket', name: 'hasTicket', type: 'boolean', sample: '' },
];
const variableLookup = buildVariableLookup(variables);

function makeCondition(variableId: string, operator: Condition['operator'], value: string) {
  return { id: `c_${variableId}`, kind: 'condition', variableId, operator, value } as const;
}

function makeGroup(match: ConditionGroup['match'], items: ConditionGroup['items']): ConditionGroup {
  return { id: `g_${match}`, kind: 'group', match, items };
}

describe('describeCondition', () => {
  it('reads a condition with the operator label of its type', () => {
    expect(describeCondition(makeCondition('v_speed', '!=', ' 10 '), variableLookup)).toBe(
      'speed ≠ 10',
    );
    expect(describeCondition(makeCondition('v_country', '==', 'BR'), variableLookup)).toBe(
      'country is "BR"',
    );
    expect(describeCondition(makeCondition('v_ticket', '!=', 'true'), variableLookup)).toBe(
      'hasTicket is not true',
    );
  });

  it('shows a blank number as a question mark and a missing variable as such', () => {
    expect(describeCondition(makeCondition('v_speed', '>', ''), variableLookup)).toBe('speed > ?');
    expect(describeCondition(makeCondition('v_gone', '>', '1'), variableLookup)).toBe(
      '(missing variable)',
    );
  });
});

describe('describeGroup', () => {
  it('reads a card as a person would say it', () => {
    const board = createExampleBoard();
    const exampleLookup = buildVariableLookup(board.variables);
    const bonusCard = board.cards[2];
    if (!bonusCard) throw new Error('the example board has three cards');

    expect(describeGroup(bonusCard.when, exampleLookup)).toBe(
      'hasTicket is true OR (country is "BR" AND coins > 10)',
    );
    expect(describeGroupLines(bonusCard.when, exampleLookup)).toEqual([
      'hasTicket is true',
      'OR (country is "BR" AND coins > 10)',
    ]);
  });

  it('reads an empty all group as always and an empty any group as never', () => {
    expect(describeGroup(makeGroup('all', []), variableLookup)).toBe('always');
    expect(describeGroup(makeGroup('any', []), variableLookup)).toBe('never');
    expect(describeGroupLines(makeGroup('any', []), variableLookup)).toEqual(['never']);
  });

  it('adds brackets only around a nested group of more than one item', () => {
    const tree = makeGroup('all', [
      makeGroup('any', [makeCondition('v_speed', '>', '1')]),
      makeCondition('v_ticket', '==', 'true'),
    ]);

    expect(describeGroup(tree, variableLookup)).toBe('speed > 1 AND hasTicket is true');
  });
});

describe('copy helpers', () => {
  const card: LogicCard = {
    id: 'card_1',
    title: '  ',
    color: 'pink',
    when: makeGroup('all', []),
    then: '',
  };

  it('falls back to a placeholder for a blank title or answer', () => {
    expect(describeCardTitle(card)).toBe('Untitled card');
    expect(describeCardTitle({ ...card, title: ' Turbo ' })).toBe('Turbo');
    expect(describeAnswer('   ')).toBe('(no answer yet)');
    expect(describeAnswer(' Go ')).toBe('Go');
  });

  it('joins all with AND and any with OR', () => {
    expect(getJoinWord('all')).toBe('AND');
    expect(getJoinWord('any')).toBe('OR');
  });
});
