import { decodeBase64Url, encodeBase64Url } from '@/lib/base64Url';
import { createId } from '@/lib/createId';
import { isRecord } from '@/lib/isRecord';
import {
  CARD_COLORS,
  type Board,
  type CardColor,
  type ConditionGroup,
  type LogicCard,
  type LogicNode,
  type Operator,
  type Variable,
  type VariableType,
} from '@/domain/models';
import { isOperatorAllowed, VARIABLE_NAME_PATTERN, VARIABLE_TYPES } from './operators';

export const BOARD_LIMITS = {
  variables: 60,
  cards: 120,
  itemsPerGroup: 60,
  groupDepth: 4,
  textLength: 300,
} as const;

const OPERATORS: readonly Operator[] = ['>', '>=', '<', '<=', '==', '!=', 'contains'];

class InvalidBoardError extends Error {}

/** A checked board, or why the input could not become one. */
export type BoardCheck = { board: Board; error: null } | { board: null; error: string };

function readText(input: unknown, fieldName: string): string {
  if (typeof input !== 'string' || input.length > BOARD_LIMITS.textLength) {
    throw new InvalidBoardError(
      `${fieldName} must be text of ${BOARD_LIMITS.textLength} characters or fewer`,
    );
  }
  return input;
}

function readArray(input: unknown, fieldName: string, maxLength: number): unknown[] {
  if (!Array.isArray(input) || input.length > maxLength) {
    throw new InvalidBoardError(`${fieldName} must be a list of ${maxLength} items or fewer`);
  }
  return input;
}

function readVariables(input: unknown): { variables: Variable[]; idMap: Map<string, Variable> } {
  const idMap = new Map<string, Variable>();
  const seenNames = new Set<string>();

  const variables = readArray(input, 'variables', BOARD_LIMITS.variables).map((entry) => {
    if (!isRecord(entry)) throw new InvalidBoardError('a variable must be an object');
    const name = readText(entry.name, 'variable name');
    const type = entry.type as VariableType;
    if (!VARIABLE_NAME_PATTERN.test(name) || seenNames.has(name.toLowerCase())) {
      throw new InvalidBoardError(`variable name ${name} is invalid or repeated`);
    }
    if (!VARIABLE_TYPES.includes(type)) throw new InvalidBoardError(`unknown type for ${name}`);
    seenNames.add(name.toLowerCase());

    const variable: Variable = {
      id: createId('variable'),
      name,
      type,
      sample: readText(entry.sample ?? '', 'test value'),
    };
    idMap.set(readText(entry.id, 'variable id'), variable);
    return variable;
  });

  return { variables, idMap };
}

function readNode(input: unknown, idMap: Map<string, Variable>, depth: number): LogicNode {
  if (!isRecord(input)) throw new InvalidBoardError('a condition must be an object');

  if (input.kind === 'group') return readGroup(input, idMap, depth + 1);

  const variable = idMap.get(readText(input.variableId, 'condition variable'));
  const operator = input.operator as Operator;
  if (!variable) throw new InvalidBoardError('a condition points at a missing variable');
  if (!OPERATORS.includes(operator) || !isOperatorAllowed(operator, variable.type)) {
    throw new InvalidBoardError(`operator ${String(operator)} does not fit ${variable.name}`);
  }
  return {
    id: createId('condition'),
    kind: 'condition',
    variableId: variable.id,
    operator,
    value: readText(input.value, 'condition value'),
  };
}

function readGroup(input: unknown, idMap: Map<string, Variable>, depth: number): ConditionGroup {
  if (!isRecord(input) || depth > BOARD_LIMITS.groupDepth) {
    throw new InvalidBoardError('groups are nested too deep or malformed');
  }
  if (input.match !== 'all' && input.match !== 'any') {
    throw new InvalidBoardError('a group must match all or any');
  }
  return {
    id: createId('group'),
    kind: 'group',
    match: input.match,
    items: readArray(input.items, 'group items', BOARD_LIMITS.itemsPerGroup).map((item) =>
      readNode(item, idMap, depth),
    ),
  };
}

function readCard(input: unknown, idMap: Map<string, Variable>): LogicCard {
  if (!isRecord(input)) throw new InvalidBoardError('a card must be an object');
  const color = CARD_COLORS.includes(input.color as CardColor)
    ? (input.color as CardColor)
    : 'pink';
  return {
    id: createId('card'),
    title: readText(input.title, 'card title'),
    color,
    when: readGroup(input.when, idMap, 1),
    then: readText(input.then, 'card answer'),
  };
}

/**
 * Checks untrusted input (a shared link, saved storage, imported JSON) and
 * rebuilds it as a board with fresh ids, or says the first thing that does
 * not fit.
 */
export function checkBoard(input: unknown): BoardCheck {
  try {
    if (!isRecord(input)) throw new InvalidBoardError('a board must be an object');
    const { variables, idMap } = readVariables(input.variables);
    const cards = readArray(input.cards, 'cards', BOARD_LIMITS.cards).map((card) =>
      readCard(card, idMap),
    );
    const board = { variables, cards, otherwise: readText(input.otherwise, 'otherwise') };
    return { board, error: null };
  } catch (error) {
    if (error instanceof InvalidBoardError) return { board: null, error: error.message };
    throw error;
  }
}

/** `checkBoard` for callers that only need to know whether it fits. */
export function parseBoard(input: unknown): Board | null {
  return checkBoard(input).board;
}

export const SHARE_HASH_PREFIX = '#board=';

export function encodeBoard(board: Board): string {
  return encodeBase64Url(JSON.stringify(board));
}

export function decodeBoard(encodedBoard: string): Board | null {
  const jsonText = decodeBase64Url(encodedBoard);
  if (jsonText === null) return null;
  try {
    return parseBoard(JSON.parse(jsonText));
  } catch {
    return null;
  }
}
