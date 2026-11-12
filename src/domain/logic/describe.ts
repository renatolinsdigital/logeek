import type {
  Condition,
  ConditionGroup,
  GroupMatch,
  LogicCard,
  LogicNode,
  VariableType,
} from '@/domain/models';
import type { VariableLookup } from './evaluate';
import { getOperatorLabel } from './operators';

/** The card's title as shown, or a placeholder while it has none. */
export function describeCardTitle(card: LogicCard): string {
  return card.title.trim() || 'Untitled card';
}

/** A card's answer (or the test run's outcome) as shown, or a placeholder while it is blank. */
export function describeAnswer(answer: string): string {
  return answer.trim() || '(no answer yet)';
}

/** The word that joins a group's items: AND for `all`, OR for `any`. */
export function getJoinWord(match: GroupMatch): 'AND' | 'OR' {
  return match === 'all' ? 'AND' : 'OR';
}

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

function describeItem(item: LogicNode, variableLookup: VariableLookup): string {
  return item.kind === 'group'
    ? describeGroup(item, variableLookup, true)
    : describeCondition(item, variableLookup);
}

export function describeGroup(
  group: ConditionGroup,
  variableLookup: VariableLookup,
  isNested = false,
): string {
  if (group.items.length === 0) return group.match === 'all' ? 'always' : 'never';

  const joinedText = group.items
    .map((item) => describeItem(item, variableLookup))
    .join(` ${getJoinWord(group.match)} `);
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
    const itemText = describeItem(item, variableLookup);
    return itemIndex === 0 ? itemText : `${getJoinWord(group.match)} ${itemText}`;
  });
}
