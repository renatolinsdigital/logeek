import { useState, type KeyboardEvent } from 'react';
import { Button, showToast } from '@/shared/components';
import type { Variable, VariableType } from '@/domain/models';
import { VARIABLE_TYPE_LABELS, VARIABLE_TYPES, validateVariableName } from '@/domain/logic';
import { useBoardStore } from '@/domain/store';
import styles from './VariableChip.module.scss';

export interface VariableChipProps {
  variable: Variable;
  variables: readonly Variable[];
  /** How many conditions read this variable; a used variable cannot be removed. */
  useCount: number;
}

/** One variable: its name (renamed in place), its type and how many conditions use it. */
function VariableChip({ variable, variables, useCount }: VariableChipProps) {
  const renameVariable = useBoardStore((state) => state.renameVariable);
  const changeVariableType = useBoardStore((state) => state.changeVariableType);
  const removeVariable = useBoardStore((state) => state.removeVariable);
  const [draftName, setDraftName] = useState<string | null>(null);

  const commitName = () => {
    if (draftName === null) return;
    const nextName = draftName.trim();
    setDraftName(null);
    if (nextName === variable.name) return;

    const nameError = validateVariableName(nextName, variables, variable.id);
    if (nameError) {
      showToast(nameError);
      return;
    }
    renameVariable(variable.id, nextName);
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
    if (event.key === 'Escape') {
      setDraftName(null);
      event.currentTarget.blur();
    }
  };

  const handleTypeChange = (nextType: VariableType) => {
    changeVariableType(variable.id, nextType);
    if (useCount > 0) {
      showToast(
        `${variable.name} is now ${VARIABLE_TYPE_LABELS[nextType]}: its ${useCount} condition${useCount === 1 ? ' was' : 's were'} reset.`,
      );
    }
  };

  const removeLabel =
    useCount > 0
      ? `${variable.name} is used by ${useCount} condition${useCount === 1 ? '' : 's'}: remove those first`
      : `Remove ${variable.name}`;

  return (
    <li className={styles.chip} data-type={variable.type}>
      <span className={styles.typeTag} aria-hidden="true">
        {variable.type === 'number' ? '#' : variable.type === 'text' ? 'Aa' : '?'}
      </span>
      <input
        className={styles.name}
        value={draftName ?? variable.name}
        aria-label={`Name of variable ${variable.name}`}
        spellCheck={false}
        autoComplete="off"
        onFocus={() => setDraftName(variable.name)}
        onChange={(event) => setDraftName(event.target.value)}
        onBlur={commitName}
        onKeyDown={handleNameKeyDown}
      />
      <select
        aria-label={`Type of ${variable.name}`}
        className={styles.type}
        value={variable.type}
        onChange={(event) => handleTypeChange(event.target.value as VariableType)}
      >
        {VARIABLE_TYPES.map((variableType) => (
          <option key={variableType} value={variableType}>
            {VARIABLE_TYPE_LABELS[variableType]}
          </option>
        ))}
      </select>
      <span className={styles.useCount} title={`Used by ${useCount} conditions`}>
        ×{useCount}
      </span>
      <Button
        variant="ghost"
        size="sm"
        icon="close"
        label={removeLabel}
        disabled={useCount > 0}
        onClick={() => removeVariable(variable.id)}
      />
    </li>
  );
}

export default VariableChip;
