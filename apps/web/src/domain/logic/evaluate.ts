import type { Board, Condition, ConditionGroup, LogicNode, Variable } from '@/domain/models';
import { parseTypedValue } from './operators';

export type VariableLookup = ReadonlyMap<string, Variable>;

export function buildVariableLookup(variables: readonly Variable[]): VariableLookup {
  return new Map(variables.map((variable) => [variable.id, variable]));
}

/**
 * Checks one condition against the variable's test value. A condition that
 * cannot be read (unknown variable, an empty number) never passes.
 */
export function evaluateCondition(condition: Condition, variableLookup: VariableLookup): boolean {
  const variable = variableLookup.get(condition.variableId);
  if (!variable) return false;

  const actualValue = parseTypedValue(variable.sample, variable.type);
  const expectedValue = parseTypedValue(condition.value, variable.type);
  if (actualValue === null || expectedValue === null) return false;

  if (condition.operator === '==') return actualValue === expectedValue;
  if (condition.operator === '!=') return actualValue !== expectedValue;
  if (condition.operator === 'contains') {
    return String(actualValue).includes(String(expectedValue));
  }

  if (typeof actualValue !== 'number' || typeof expectedValue !== 'number') return false;

  switch (condition.operator) {
    case '>':
      return actualValue > expectedValue;
    case '>=':
      return actualValue >= expectedValue;
    case '<':
      return actualValue < expectedValue;
    case '<=':
      return actualValue <= expectedValue;
  }
}

function evaluateNode(node: LogicNode, variableLookup: VariableLookup): boolean {
  return node.kind === 'group'
    ? evaluateGroup(node, variableLookup)
    : evaluateCondition(node, variableLookup);
}

/** `all` passes when every item passes (so an empty one always does); `any` when one does. */
export function evaluateGroup(group: ConditionGroup, variableLookup: VariableLookup): boolean {
  return group.match === 'all'
    ? group.items.every((item) => evaluateNode(item, variableLookup))
    : group.items.some((item) => evaluateNode(item, variableLookup));
}

export interface BoardRunStep {
  cardId: string;
  isMatch: boolean;
}

export interface BoardRun {
  /** The cards checked, in order, up to and including the one that matched. */
  steps: BoardRunStep[];
  matchedCardId: string | null;
  outcome: string;
}

export type CardRunState = 'match' | 'miss' | 'skipped';

/** What a run did with one card: it answered, it was checked and failed, or it was never reached. */
export function getCardRunState(run: BoardRun, cardId: string): CardRunState {
  const step = run.steps.find((candidate) => candidate.cardId === cardId);
  if (!step) return 'skipped';
  return step.isMatch ? 'match' : 'miss';
}

/** Walks the cards in order with the variables' test values, like the flowchart does. */
export function runBoard(board: Board): BoardRun {
  const variableLookup = buildVariableLookup(board.variables);
  const steps: BoardRunStep[] = [];

  for (const card of board.cards) {
    const isMatch = evaluateGroup(card.when, variableLookup);
    steps.push({ cardId: card.id, isMatch });
    if (isMatch) return { steps, matchedCardId: card.id, outcome: card.then };
  }

  return { steps, matchedCardId: null, outcome: board.otherwise };
}
