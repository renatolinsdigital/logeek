import { useId } from 'react';
import { SegmentedControl } from '@/shared/components';
import type { Variable } from '@/domain/models';
import { parseTypedValue } from '@/domain/logic';
import { useBoardStore } from '@/domain/store';
import styles from './TestRunInputs.module.scss';

const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
] as const;

function TestValueField({ variable }: { variable: Variable }) {
  const setVariableSample = useBoardStore((state) => state.setVariableSample);
  const inputId = useId();

  if (variable.type === 'boolean') {
    return (
      <div className={styles.field}>
        {/* The visible name matches the other fields; the control's legend names it for screen readers. */}
        <span className={styles.label} aria-hidden="true">
          {variable.name}
        </span>
        <SegmentedControl<'true' | 'false'>
          legend={variable.name}
          tone="crt"
          size="sm"
          options={BOOLEAN_OPTIONS}
          value={variable.sample === 'true' ? 'true' : 'false'}
          onChange={(sample) => setVariableSample(variable.id, sample)}
        />
      </div>
    );
  }

  const isNumber = variable.type === 'number';
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {variable.name}
      </label>
      <input
        id={inputId}
        className={styles.input}
        value={variable.sample}
        inputMode={isNumber ? 'decimal' : 'text'}
        placeholder={isNumber ? '0' : 'text'}
        aria-invalid={parseTypedValue(variable.sample, variable.type) === null}
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => setVariableSample(variable.id, event.target.value)}
      />
    </div>
  );
}

export interface TestRunInputsProps {
  variables: readonly Variable[];
}

/** One field per variable: the values the flowchart runs with. */
function TestRunInputs({ variables }: TestRunInputsProps) {
  if (variables.length === 0) {
    return <p className={styles.empty}>Add a variable to give the test run something to try.</p>;
  }

  return (
    <fieldset className={styles.inputs}>
      <legend className={styles.legend}>Test values</legend>
      {variables.map((variable) => (
        <TestValueField key={variable.id} variable={variable} />
      ))}
    </fieldset>
  );
}

export default TestRunInputs;
