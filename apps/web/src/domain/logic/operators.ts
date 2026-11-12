import type { Operator, Variable, VariableType } from '@/domain/models';

export const OPERATORS_BY_TYPE: Record<VariableType, readonly Operator[]> = {
  number: ['>', '>=', '<', '<=', '==', '!='],
  text: ['==', '!=', 'contains'],
  boolean: ['==', '!='],
};

export const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  number: 'Number',
  text: 'Text',
  boolean: 'True / False',
};

export const VARIABLE_TYPES = Object.keys(VARIABLE_TYPE_LABELS) as VariableType[];

const NUMBER_OPERATOR_LABELS: Partial<Record<Operator, string>> = { '==': '=', '!=': '≠' };
const WORD_OPERATOR_LABELS: Partial<Record<Operator, string>> = { '==': 'is', '!=': 'is not' };

/** How an operator reads to a person: `≠` for numbers, `is not` for text and switches. */
export function getOperatorLabel(operator: Operator, variableType: VariableType): string {
  const labels = variableType === 'number' ? NUMBER_OPERATOR_LABELS : WORD_OPERATOR_LABELS;
  return labels[operator] ?? operator;
}

export function isOperatorAllowed(operator: Operator, variableType: VariableType): boolean {
  return OPERATORS_BY_TYPE[variableType].includes(operator);
}

export function getDefaultOperator(variableType: VariableType): Operator {
  return OPERATORS_BY_TYPE[variableType][0] ?? '==';
}

export function getDefaultValue(variableType: VariableType): string {
  if (variableType === 'number') return '0';
  if (variableType === 'boolean') return 'true';
  return '';
}

/**
 * Reads a typed-in value through a variable type. Returns null when the text
 * is not a value of that type (an empty or non-numeric number, say).
 */
export function parseTypedValue(
  rawValue: string,
  variableType: VariableType,
): number | string | boolean | null {
  if (variableType === 'text') return rawValue;
  if (variableType === 'boolean') {
    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;
    return null;
  }
  const trimmedValue = rawValue.trim();
  if (trimmedValue === '') return null;
  const numberValue = Number(trimmedValue);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,31}$/;

/** Returns why a variable name cannot be used, or null when it can. */
export function validateVariableName(
  name: string,
  variables: readonly Variable[],
  ignoredVariableId?: string,
): string | null {
  if (name.trim() === '') return 'Give the variable a name.';
  if (!VARIABLE_NAME_PATTERN.test(name)) {
    return 'Use letters, digits and _ only, starting with a letter (32 at most).';
  }
  const isTaken = variables.some(
    (variable) =>
      variable.id !== ignoredVariableId && variable.name.toLowerCase() === name.toLowerCase(),
  );
  return isTaken ? `There is already a variable called ${name}.` : null;
}
