import type { Condition, ConditionGroup, VariableType } from '@/domain/models';
import type { VariableLookup } from './evaluate';
import { getOperatorLabel } from './operators';

function describeValue(rawValue: string, variableType: VariableType): string {
  if (variableType === 'text') return JSON.stringify(rawValue);
  return rawValue.trim() === '' ? '?' : rawValue.trim();
}

/** Reads a condition as a person would say it: `speed > 100`, `country is "BR"`. */
export function describeCondition(condition: Condition, variableLookup: VariableLookup): string {
  const variable = variableLookup.get(condition.variableId);
  if (!variable) return '(missing variable)';
  const operatorLabel = getOperatorLabel(condition.operator, variable.type);
  return `${variable.name} ${operatorLabel} ${describeValue(condition.value, variable.type)}`;
}

function getJoinWord(group: ConditionGroup): string {
  return group.match === 'all' ? 'AND' : 'OR';
}

export function describeGroup(
  group: ConditionGroup,
  variableLookup: VariableLookup,
  isNested = false,
): string {
  if (group.items.length === 0) return group.match === 'all' ? 'always' : 'never';

  const itemTexts = group.items.map((item) =>
    item.kind === 'group'
      ? describeGroup(item, variableLookup, true)
      : describeCondition(item, variableLookup),
  );
  const joinedText = itemTexts.join(` ${getJoinWord(group)} `);
  return isNested && group.items.length > 1 ? `(${joinedText})` : joinedText;
}

/**
 * The card's question split into lines for the flowchart: the first item as
 * is, every later one led by AND or OR.
 */
export function describeGroupLines(
  group: ConditionGroup,
  variableLookup: VariableLookup,
): string[] {
  if (group.items.length === 0) return [describeGroup(group, variableLookup)];

  return group.items.map((item, itemIndex) => {
    const itemText =
      item.kind === 'group'
        ? describeGroup(item, variableLookup, true)
        : describeCondition(item, variableLookup);
    return itemIndex === 0 ? itemText : `${getJoinWord(group)} ${itemText}`;
  });
}
