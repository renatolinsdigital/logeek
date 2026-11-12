import { classNames } from '@/lib/classNames';
import styles from './SegmentedControl.module.scss';

export interface SegmentedOption<OptionValue extends string> {
  value: OptionValue;
  label: string;
}

export interface SegmentedControlProps<OptionValue extends string> {
  legend: string;
  options: ReadonlyArray<SegmentedOption<OptionValue>>;
  value: OptionValue;
  onChange: (value: OptionValue) => void;
  isLegendVisible?: boolean;
  tone?: 'paper' | 'crt';
  size?: 'md' | 'sm';
  className?: string;
}

/** A row of toggle buttons where exactly one is pressed, named by its legend. */
function SegmentedControl<OptionValue extends string>({
  legend,
  options,
  value,
  onChange,
  isLegendVisible = false,
  tone = 'paper',
  size = 'md',
  className,
}: SegmentedControlProps<OptionValue>) {
  return (
    <fieldset className={classNames(styles.fieldset, styles[tone], styles[size], className)}>
      <legend className={isLegendVisible ? styles.legend : styles.hiddenLegend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            className={styles.option}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default SegmentedControl;
