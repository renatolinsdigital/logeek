import { Button } from '@/shared/components';
import { classNames } from '@/lib/classNames';
import type { Condition, Operator, Variable } from '@/domain/models';
import { getOperatorLabel, OPERATORS_BY_TYPE, parseTypedValue } from '@/domain/logic';
import { useBoardStore } from '@/domain/store';
import styles from './ConditionRow.module.scss';

export interface ConditionRowProps {
  cardId: string;
  condition: Condition;
  variables: readonly Variable[];
}

/** One comparison on a card: variable, operator, value. */
function ConditionRow({ cardId, condition, variables }: ConditionRowProps) {
  const updateCondition = useBoardStore((state) => state.updateCondition);
  const removeNode = useBoardStore((state) => state.removeNode);
  const variable = variables.find((candidate) => candidate.id === condition.variableId);
  const variableType = variable?.type ?? 'text';
  const isValueInvalid = parseTypedValue(condition.value, variableType) === null;

  const setValue = (value: string) => updateCondition(cardId, condition.id, { value });

  return (
    <div className={styles.frame}>
      <div className={styles.row}>
        <select
          className={classNames(styles.control, styles.variable)}
          aria-label="Variable"
          value={condition.variableId}
          onChange={(event) =>
            updateCondition(cardId, condition.id, { variableId: event.target.value })
          }
        >
          {variables.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <select
          className={classNames(styles.control, styles.operator)}
          aria-label="Operator"
          value={condition.operator}
          onChange={(event) =>
            updateCondition(cardId, condition.id, { operator: event.target.value as Operator })
          }
        >
          {OPERATORS_BY_TYPE[variableType].map((operator) => (
            <option key={operator} value={operator}>
              {getOperatorLabel(operator, variableType)}
            </option>
          ))}
        </select>

        {variableType === 'boolean' ? (
          <select
            className={classNames(styles.control, styles.value)}
            aria-label="Value"
            value={condition.value}
            onChange={(event) => setValue(event.target.value)}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            className={classNames(styles.control, styles.value)}
            aria-label="Value"
            aria-invalid={isValueInvalid}
            value={condition.value}
            inputMode={variableType === 'number' ? 'decimal' : 'text'}
            placeholder={variableType === 'number' ? '0' : 'text'}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => setValue(event.target.value)}
          />
        )}

        <Button
          variant="ghost"
          size="sm"
          icon="close"
          label={`Remove condition on ${variable?.name ?? 'missing variable'}`}
          onClick={() => removeNode(cardId, condition.id)}
        />
      </div>
    </div>
  );
}

export default ConditionRow;
