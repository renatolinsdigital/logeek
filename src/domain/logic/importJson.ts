import { isRecord } from '@/lib/isRecord';
import { CARD_COLORS, type VariableType } from '@/domain/models';
import { BOARD_LIMITS, checkBoard, type BoardCheck } from './boardCodec';
import { getDefaultValue, VARIABLE_TYPES } from './operators';

class InvalidDocumentError extends Error {}

// Condition values are stored as typed text, so the JSON's numbers and
// booleans go back to text. Anything else is left for checkBoard to refuse.
function toTypedText(value: unknown): unknown {
  if (value === null) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return value;
}

function toBoardNode(node: unknown, depth: number): unknown {
  if (!isRecord(node)) throw new InvalidDocumentError('a condition must be an object');
  const hasAll = 'all' in node;
  const hasAny = 'any' in node;
  if (hasAll && hasAny) {
    throw new InvalidDocumentError('a group must hold either all or any, not both');
  }
  if (hasAll || hasAny) return toBoardGroup(node, depth + 1);
  return {
    kind: 'condition',
    variableId: node.variable,
    operator: node.operator,
    value: toTypedText(node.value),
  };
}

function toBoardGroup(group: Record<string, unknown>, depth: number): unknown {
  // Checked here as well as in checkBoard, so a deeply nested paste cannot
  // overflow the stack before checkBoard sees it.
  if (depth > BOARD_LIMITS.groupDepth) throw new InvalidDocumentError('groups are nested too deep');
  const match = 'all' in group ? 'all' : 'any';
  const items = group[match];
  if (!Array.isArray(items)) throw new InvalidDocumentError(`${match} must be a list`);
  return { kind: 'group', match, items: items.map((item) => toBoardNode(item, depth)) };
}

// The export always wraps a decision in a group; a hand-written single
// condition is accepted as a group of one.
function toRootGroup(condition: unknown): unknown {
  if (isRecord(condition) && ('all' in condition || 'any' in condition)) {
    return toBoardNode(condition, 0);
  }
  return { kind: 'group', match: 'all', items: [toBoardNode(condition, 1)] };
}

function toBoardVariables(variables: unknown): unknown[] {
  if (!isRecord(variables)) {
    throw new InvalidDocumentError('variables must be an object of names and types');
  }
  return Object.entries(variables).map(([name, type]) => ({
    id: name,
    name,
    type,
    sample: VARIABLE_TYPES.includes(type as VariableType)
      ? getDefaultValue(type as VariableType)
      : '',
  }));
}

function toBoardCards(decisions: unknown): unknown[] {
  if (!Array.isArray(decisions)) throw new InvalidDocumentError('decisions must be a list');
  return decisions.map((decision, decisionIndex) => {
    if (!isRecord(decision)) throw new InvalidDocumentError('a decision must be an object');
    if (!('if' in decision)) {
      throw new InvalidDocumentError(`decision ${decisionIndex + 1} has no if`);
    }
    return {
      title: decision.name,
      color: CARD_COLORS[decisionIndex % CARD_COLORS.length],
      when: toRootGroup(decision.if),
      then: decision.then,
    };
  });
}

/**
 * Rebuilds a board from JSON in the Logeek format (what the JSON panel
 * exports). The document is turned into the board shape a share link
 * carries and goes through the same `checkBoard`, so both paths share one
 * gate. The format has no colours or test values: cards take the palette in
 * order and every test value starts at its type's default.
 */
export function parseLogeekJson(jsonText: string): BoardCheck {
  let document: unknown;
  try {
    document = JSON.parse(jsonText);
  } catch {
    return { board: null, error: 'this is not valid JSON' };
  }

  if (!isRecord(document)) {
    return { board: null, error: 'the JSON must be an object with variables and decisions' };
  }
  if ('if' in document && !('decisions' in document)) {
    return {
      board: null,
      error:
        'this is JsonLogic, which has no card names or variable types (copy the Logeek format instead)',
    };
  }

  try {
    return checkBoard({
      variables: toBoardVariables(document.variables),
      cards: toBoardCards(document.decisions),
      otherwise: document.otherwise,
    });
  } catch (error) {
    if (error instanceof InvalidDocumentError) return { board: null, error: error.message };
    throw error;
  }
}
