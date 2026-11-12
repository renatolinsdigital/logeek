export type VariableType = 'number' | 'text' | 'boolean';

/** A named input the cards reason about, such as `speed` or `age`. */
export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  /** The value used by the test run, kept as typed so a half-written number survives. */
  sample: string;
}

export type Operator = '>' | '>=' | '<' | '<=' | '==' | '!=' | 'contains';

/** One comparison: `speed > 100`. The value is kept as typed and read through the variable's type. */
export interface Condition {
  id: string;
  kind: 'condition';
  variableId: string;
  operator: Operator;
  value: string;
}

export type GroupMatch = 'all' | 'any';

/** Conditions joined by AND (`all`) or OR (`any`). Groups can hold groups. */
export interface ConditionGroup {
  id: string;
  kind: 'group';
  match: GroupMatch;
  items: LogicNode[];
}

export type LogicNode = Condition | ConditionGroup;

export const CARD_COLORS = ['pink', 'cyan', 'lime', 'yellow', 'orange', 'violet'] as const;

export type CardColor = (typeof CARD_COLORS)[number];

/** One decision: when its conditions pass, the board answers with `then`. */
export interface LogicCard {
  id: string;
  title: string;
  color: CardColor;
  when: ConditionGroup;
  then: string;
}

/** Cards are checked in order; the first that passes wins, else `otherwise` answers. */
export interface Board {
  variables: Variable[];
  cards: LogicCard[];
  otherwise: string;
}

export type JsonFormat = 'logeek' | 'jsonlogic';
