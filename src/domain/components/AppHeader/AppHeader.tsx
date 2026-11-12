import markUrl from '@/assets/logeek-mark.svg';
import { Button, showToast } from '@/shared/components';
import { useCopyShareLink } from '@/domain/hooks';
import { selectBoard, useBoardStore } from '@/domain/store';
import styles from './AppHeader.module.scss';

const STEPS = [
  { color: 'cyan', text: 'Name your variables' },
  { color: 'pink', text: 'Stack logic cards' },
  { color: 'lime', text: 'Test the flow' },
] as const;

/** The title screen: brand, the three steps, and the board-wide actions. */
function AppHeader() {
  const copyShareLink = useCopyShareLink();

  // Both actions replace the whole board, so each keeps a snapshot for Undo.
  const replaceBoard = (action: 'resetToExamples' | 'clearBoard', message: string) => {
    const previousBoard = selectBoard(useBoardStore.getState());
    useBoardStore.getState()[action]();
    showToast(message, {
      action: { label: 'Undo', onAction: () => useBoardStore.getState().loadBoard(previousBoard) },
    });
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.coin} aria-hidden="true">
            Insert coin
          </p>
          <h1 className={styles.title}>
            <img className={styles.mark} src={markUrl} alt="" width={64} height={64} />
            Logeek
          </h1>
          <p className={styles.tagline}>
            Stack logic cards. Get JSON and a flowchart your whole team can read.
          </p>
        </div>

        <nav className={styles.actions} aria-label="Board actions">
          <Button variant="primary" icon="share" onClick={copyShareLink}>
            Share link
          </Button>
          <Button
            icon="reset"
            onClick={() => replaceBoard('resetToExamples', 'Example cards loaded.')}
          >
            Examples
          </Button>
          <Button
            variant="danger"
            icon="trash"
            onClick={() => replaceBoard('clearBoard', 'Board cleared. Fresh start!')}
          >
            Clear
          </Button>
        </nav>
      </div>

      <ol className={styles.steps}>
        {STEPS.map((step, stepIndex) => (
          <li key={step.text} className={styles.step} data-color={step.color}>
            <span className={styles.stepNumber}>{stepIndex + 1}</span>
            {step.text}
          </li>
        ))}
      </ol>
    </header>
  );
}

export default AppHeader;
