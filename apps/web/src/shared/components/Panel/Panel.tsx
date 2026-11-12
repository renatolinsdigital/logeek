import { useId, type ReactNode } from 'react';
import { classNames } from '@/lib/classNames';
import styles from './Panel.module.scss';

export interface PanelProps {
  /** Small text above the title, such as a step number. */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: 'paper' | 'crt';
  children: ReactNode;
  className?: string;
}

/** A titled section of the page, as a light slab or a dark arcade screen. */
function Panel({
  eyebrow,
  title,
  description,
  actions,
  tone = 'paper',
  children,
  className,
}: PanelProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={classNames(styles.panel, styles[tone], className)}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

export default Panel;
