import { useId, useState, type FormEvent } from 'react';
import { Button, Panel } from '@/shared/components';
import type { VariableType } from '@/domain/models';
import { VARIABLE_TYPE_LABELS, VARIABLE_TYPES, validateVariableName } from '@/domain/logic';
import { countVariableUses, useBoardStore } from '@/domain/store';
import { VariableChip } from '../VariableChip';
import styles from './VariablesPanel.module.scss';

/** Stage 1: the variables the cards can reason about, and the form that adds one. */
function VariablesPanel() {
  const variables = useBoardStore((state) => state.variables);
  const cards = useBoardStore((state) => state.cards);
  const addVariable = useBoardStore((state) => state.addVariable);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VariableType>('number');
  const [nameError, setNameError] = useState<string | null>(null);
  const nameId = useId();
  const typeId = useId();
  const errorId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = newName.trim();
    const validationError = validateVariableName(trimmedName, variables);
    if (validationError) {
      setNameError(validationError);
      return;
    }
    addVariable(trimmedName, newType);
    setNewName('');
    setNameError(null);
  };

  return (
    <Panel
      eyebrow="Stage 1"
      title="Variables"
      description="The facts your system knows, like speed or age. Name them once and use them on any card."
    >
      {variables.length > 0 ? (
        <ul className={styles.list} aria-label="Variables">
          {variables.map((variable) => (
            <VariableChip
              key={variable.id}
              variable={variable}
              variables={variables}
              useCount={countVariableUses(cards, variable.id)}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No variables yet. Add the first one below.</p>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={nameId}>
            New variable
          </label>
          <input
            id={nameId}
            className={styles.input}
            value={newName}
            placeholder="e.g. temperature"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? errorId : undefined}
            onChange={(event) => {
              setNewName(event.target.value);
              setNameError(null);
            }}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={typeId}>
            Type
          </label>
          <select
            id={typeId}
            className={styles.input}
            value={newType}
            onChange={(event) => setNewType(event.target.value as VariableType)}
          >
            {VARIABLE_TYPES.map((variableType) => (
              <option key={variableType} value={variableType}>
                {VARIABLE_TYPE_LABELS[variableType]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="primary" icon="plus">
          Add variable
        </Button>
        {nameError && (
          <p id={errorId} className={styles.error} role="alert">
            {nameError}
          </p>
        )}
      </form>
    </Panel>
  );
}

export default VariablesPanel;
