import { describe, expect, it } from 'vitest';
import type { Condition, ConditionGroup, LogicCard } from '@/domain/models';
import {
  appendNode,
  cloneWithNewIds,
  collectConditions,
  countVariableUses,
  mapConditions,
  removeNode,
  updateNode,
} from './tree';

function makeCondition(id: string, variableId = 'variable_speed'): Condition {
  return { id, kind: 'condition', variableId, operator: '>', value: '1' };
}

// root (all): c1, nested (any): [c2, c3]
function makeTree(): ConditionGroup {
  return {
    id: 'root',
    kind: 'group',
    match: 'all',
    items: [
      makeCondition('c1'),
      {
        id: 'nested',
        kind: 'group',
        match: 'any',
        items: [makeCondition('c2', 'variable_age'), makeCondition('c3')],
      },
    ],
  };
}

describe('tree', () => {
  it('replaces one node anywhere in the tree and leaves the input untouched', () => {
    const tree = makeTree();

    const updatedTree = updateNode(tree, 'c3', (node) => ({ ...node, id: 'c3_updated' }));

    expect(collectConditions(updatedTree).map((condition) => condition.id)).toEqual([
      'c1',
      'c2',
      'c3_updated',
    ]);
    expect(collectConditions(tree).map((condition) => condition.id)).toEqual(['c1', 'c2', 'c3']);
  });

  it('removes a condition, or a group with everything inside it', () => {
    expect(collectConditions(removeNode(makeTree(), 'c2')).map((node) => node.id)).toEqual([
      'c1',
      'c3',
    ]);
    expect(removeNode(makeTree(), 'nested').items.map((node) => node.id)).toEqual(['c1']);
  });

  it('appends a node to the end of the target group only', () => {
    const tree = appendNode(makeTree(), 'nested', makeCondition('c4'));

    expect(collectConditions(tree).map((condition) => condition.id)).toEqual([
      'c1',
      'c2',
      'c3',
      'c4',
    ]);
    expect(appendNode(makeTree(), 'c1', makeCondition('c4'))).toEqual(makeTree());
  });

  it('maps every condition at any depth', () => {
    const tree = mapConditions(makeTree(), (condition) => ({ ...condition, value: '9' }));

    expect(collectConditions(tree).map((condition) => condition.value)).toEqual(['9', '9', '9']);
  });

  it('copies a tree with a fresh id for every node', () => {
    let nextNumber = 0;
    const copiedTree = cloneWithNewIds(makeTree(), (kind) => `${kind}_${(nextNumber += 1)}`);

    expect(copiedTree.id).toBe('group_1');
    expect(copiedTree.items.map((node) => node.id)).toEqual(['condition_2', 'group_3']);
    expect(collectConditions(copiedTree).map((condition) => condition.id)).toEqual([
      'condition_2',
      'condition_4',
      'condition_5',
    ]);
  });

  it('counts the conditions on a variable across every card', () => {
    const cards: LogicCard[] = [
      { id: 'card_1', title: 'One', color: 'pink', when: makeTree(), then: '' },
      { id: 'card_2', title: 'Two', color: 'cyan', when: makeTree(), then: '' },
    ];

    expect(countVariableUses(cards, 'variable_speed')).toBe(4);
    expect(countVariableUses(cards, 'variable_age')).toBe(2);
    expect(countVariableUses(cards, 'variable_unused')).toBe(0);
  });
});
