import type {
  Board,
  Condition,
  ConditionGroup,
  JsonFormat,
  Operator,
  VariableType,
} from '@/domain/models';
import { buildVariableLookup, type VariableLookup } from './evaluate';
import { parseTypedValue } from './operators';

type JsonValue = number | string | boolean | null;

export interface LogeekCondition {
  variable: string;
  operator: Operator;
  value: JsonValue;
}

export type LogeekNode = LogeekCondition | { all: LogeekNode[] } | { any: LogeekNode[] };

export interface LogeekDocument {
  variables: Record<string, VariableType>;
  decisions: Array<{ name: string; if: LogeekNode; then: string }>;
  otherwise: string;
}

function toLogeekCondition(condition: Condition, variableLookup: VariableLookup): LogeekCondition {
  const variable = variableLookup.get(condition.variableId);
  return {
    variable: variable?.name ?? '',
    operator: condition.operator,
    value: variable ? parseTypedValue(condition.value, variable.type) : null,
  };
}

function toLogeekGroup(group: ConditionGroup, variableLookup: VariableLookup): LogeekNode {
  const items = group.items.map((item) =>
    item.kind === 'group'
      ? toLogeekGroup(item, variableLookup)
      : toLogeekCondition(item, variableLookup),
  );
  return group.match === 'all' ? { all: items } : { any: items };
}

/** The readable format: every card as `{ name, if, then }`, checked top to bottom. */
export function toLogeekJson(board: Board): LogeekDocument {
  const variableLookup = buildVariableLookup(board.variables);
  return {
    variables: Object.fromEntries(board.variables.map(({ name, type }) => [name, type])),
    decisions: board.cards.map((card) => ({
      name: card.title,
      if: toLogeekGroup(card.when, variableLookup),
      then: card.then,
    })),
    otherwise: board.otherwise,
  };
}

function toJsonLogicCondition(condition: Condition, variableLookup: VariableLookup): unknown {
  const { variable, operator, value } = toLogeekCondition(condition, variableLookup);
  const variableReference = { var: variable };
  if (operator === 'contains') return { in: [value, variableReference] };
  return { [operator]: [variableReference, value] };
}

function toJsonLogicGroup(group: ConditionGroup, variableLookup: VariableLookup): unknown {
  if (group.items.length === 0) return group.match === 'all';
  const items = group.items.map((item) =>
    item.kind === 'group'
      ? toJsonLogicGroup(item, variableLookup)
      : toJsonLogicCondition(item, variableLookup),
  );
  return { [group.match === 'all' ? 'and' : 'or']: items };
}

/**
 * The board as one JsonLogic rule (https://jsonlogic.com): an `if` chain of
 * condition, answer, condition, answer, ..., fallback. Runs as is with any
 * JsonLogic library and the variables as data.
 */
export function toJsonLogic(board: Board): unknown {
  if (board.cards.length === 0) return board.otherwise;
  const variableLookup = buildVariableLookup(board.variables);
  const branches = board.cards.flatMap((card) => [
    toJsonLogicGroup(card.when, variableLookup),
    card.then,
  ]);
  return { if: [...branches, board.otherwise] };
}

export function formatBoardJson(board: Board, format: JsonFormat, isCompact: boolean): string {
  const document = format === 'logeek' ? toLogeekJson(board) : toJsonLogic(board);
  return JSON.stringify(document, null, isCompact ? undefined : 2);
}
