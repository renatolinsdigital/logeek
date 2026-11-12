import { createId } from '@/lib/createId';
import type { Board, Condition, ConditionGroup, Operator, Variable } from '@/domain/models';

function condition(variable: Variable, operator: Operator, value: string): Condition {
  return { id: createId('condition'), kind: 'condition', variableId: variable.id, operator, value };
}

function group(match: ConditionGroup['match'], items: ConditionGroup['items']): ConditionGroup {
  return { id: createId('group'), kind: 'group', match, items };
}

function variable(name: string, type: Variable['type'], sample: string): Variable {
  return { id: createId('variable'), name, type, sample };
}

/**
 * The three cards a new board starts with: an arcade cabinet deciding what a
 * player gets. Together they show AND, OR, a nested group and every type.
 * The test values make the run say NO to card 1 and YES to card 2.
 */
export function createExampleBoard(): Board {
  const speed = variable('speed', 'number', '80');
  const coins = variable('coins', 'number', '12');
  const age = variable('age', 'number', '21');
  const hasTicket = variable('hasTicket', 'boolean', 'false');
  const country = variable('country', 'text', 'BR');

  return {
    variables: [speed, coins, age, hasTicket, country],
    cards: [
      {
        id: createId('card'),
        title: 'Turbo mode',
        color: 'pink',
        when: group('all', [condition(speed, '>', '100'), condition(coins, '>=', '3')]),
        then: 'Unlock the turbo boost',
      },
      {
        id: createId('card'),
        title: 'Night league',
        color: 'cyan',
        when: group('all', [condition(age, '>=', '18')]),
        then: 'Join the night league',
      },
      {
        id: createId('card'),
        title: 'Bonus round',
        color: 'lime',
        when: group('any', [
          condition(hasTicket, '==', 'true'),
          group('all', [condition(country, '==', 'BR'), condition(coins, '>', '10')]),
        ]),
        then: 'Play a bonus round',
      },
    ],
    otherwise: 'Insert coin to continue',
  };
}
