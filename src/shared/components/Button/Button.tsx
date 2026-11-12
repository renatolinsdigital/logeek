import type { ComponentProps } from 'react';
import { classNames } from '@/lib/classNames';
import { PixelIcon, type PixelIconName } from '../PixelIcon';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: PixelIconName;
  /** With no visible text the button needs a label for screen readers, shown as a tooltip too. */
  label?: string;
}

/** A chunky arcade button that sinks into its shadow when pressed. */
function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  label,
  type = 'button',
  className,
  children,
  ...buttonProps
}: ButtonProps) {
  const isIconOnly = children === undefined || children === null;

  return (
    <button
      type={type}
      aria-label={isIconOnly ? label : undefined}
      title={label}
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        isIconOnly && styles.iconOnly,
        className,
      )}
      {...buttonProps}
    >
      {icon && <PixelIcon name={icon} size={size === 'sm' ? 12 : 16} />}
      {!isIconOnly && <span>{children}</span>}
    </button>
  );
}

export default Button;
