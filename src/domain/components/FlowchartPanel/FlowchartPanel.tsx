import { useMemo } from 'react';
import { Panel, PixelIcon } from '@/shared/components';
import { runBoard } from '@/domain/logic';
import { useBoard } from '@/domain/store';
import { Flowchart } from '../Flowchart';
import { TestRunInputs } from '../TestRunInputs';
import styles from './FlowchartPanel.module.scss';

/**
 * Stage 3, the finale: the test values and the answer they produce beside the
 * flowchart with the path lit, across the whole page width.
 */
function FlowchartPanel() {
  const board = useBoard();
  const run = useMemo(() => runBoard(board), [board]);
  const matchedPosition = board.cards.findIndex((card) => card.id === run.matchedCardId) + 1;
  const matchedCard = board.cards[matchedPosition - 1];

  return (
    <Panel
      tone="crt"
      eyebrow="Stage 3"
      title="Flowchart"
      description="Try values and watch the decision path light up."
      className={styles.panel}
    >
      <div className={styles.layout}>
        <div className={styles.controls}>
          <TestRunInputs variables={board.variables} />

          <output className={styles.result}>
            <PixelIcon name="play" size={24} className={styles.resultIcon} />
            <span className={styles.resultText}>
              <span className={styles.resultLabel}>Answer</span>
              <strong className={styles.resultValue}>
                {run.outcome.trim() || '(no answer yet)'}
              </strong>
              <span className={styles.resultSource}>
                {matchedCard
                  ? `from card #${matchedPosition}, ${matchedCard.title.trim() || 'Untitled card'}`
                  : 'no card passed, so the fallback answers'}
              </span>
            </span>
          </output>
        </div>

        <div className={styles.chart}>
          <Flowchart board={board} run={run} />
        </div>
      </div>
    </Panel>
  );
}

export default FlowchartPanel;
