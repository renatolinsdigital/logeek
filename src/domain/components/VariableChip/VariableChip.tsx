import { useRef, useState, type KeyboardEvent } from 'react';
import { Button, showToast } from '@/shared/components';
import { pluralize } from '@/lib/pluralize';
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

const TYPE_TAGS: Record<VariableType, string> = { number: '#', text: 'Aa', boolean: '?' };

/** One variable: its name (renamed in place), its type and how many conditions use it. */
function VariableChip({ variable, variables, useCount }: VariableChipProps) {
  const renameVariable = useBoardStore((state) => state.renameVariable);
  const changeVariableType = useBoardStore((state) => state.changeVariableType);
  const removeVariable = useBoardStore((state) => state.removeVariable);
  const [draftName, setDraftName] = useState<string | null>(null);
  // blur() inside the Escape handler runs onBlur before React re-renders, so
  // the cancel has to reach commitName through a ref, not through state.
  const isCancellingRef = useRef(false);

  const commitName = () => {
    const isCancelled = isCancellingRef.current;
    isCancellingRef.current = false;
    setDraftName(null);
    if (isCancelled || draftName === null) return;

    const nextName = draftName.trim();
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
      isCancellingRef.current = true;
      event.currentTarget.blur();
    }
  };

  const handleTypeChange = (nextType: VariableType) => {
    changeVariableType(variable.id, nextType);
    if (useCount > 0) {
      const resetConditions = `${pluralize(useCount, 'condition')} ${useCount === 1 ? 'was' : 'were'}`;
      showToast(
        `${variable.name} is now ${VARIABLE_TYPE_LABELS[nextType]}: its ${resetConditions} reset.`,
      );
    }
  };

  const removeLabel =
    useCount > 0
      ? `${variable.name} is used by ${pluralize(useCount, 'condition')}: remove those first`
      : `Remove ${variable.name}`;

  return (
    <li className={styles.chip} data-type={variable.type}>
      <span className={styles.typeTag} aria-hidden="true">
        {TYPE_TAGS[variable.type]}
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
