import { useMemo } from 'react';
import type { Board } from '@/domain/models';
import {
  buildVariableLookup,
  describeGroupLines,
  getCardRunState,
  type BoardRun,
} from '@/domain/logic';
import styles from './Flowchart.module.scss';

export interface FlowchartProps {
  board: Board;
  run: BoardRun;
}

function Connector({ label, isLit }: { label?: string; isLit: boolean }) {
  return (
    <div className={styles.connector} data-lit={isLit} aria-hidden="true">
      {label && <span className={styles.connectorLabel}>{label}</span>}
    </div>
  );
}

/**
 * The board as a decision chain: each card asks its question, YES leads to
 * its answer and NO falls through to the next card, down to the fallback.
 * The path the test run took is lit; what it never reached is dimmed.
 */
function Flowchart({ board, run }: FlowchartProps) {
  const variableLookup = useMemo(() => buildVariableLookup(board.variables), [board.variables]);
  const isFallbackReached = run.matchedCardId === null;

  return (
    <ol className={styles.flow} aria-label="Decision flowchart">
      <li className={styles.step} data-state="match">
        <div className={styles.start}>Start</div>
      </li>

      {board.cards.map((card, cardIndex) => {
        const runState = getCardRunState(run, card.id);
        const isMatch = runState === 'match';
        const questionLines = describeGroupLines(card.when, variableLookup);

        return (
          <li key={card.id} className={styles.step} data-state={runState}>
            <Connector label={cardIndex === 0 ? undefined : 'No'} isLit={runState !== 'skipped'} />
            <div className={styles.branch}>
              <div className={styles.decision} data-color={card.color}>
                <p className={styles.decisionTitle}>
                  <span className={styles.diamond} aria-hidden="true" />
                  <span>
                    #{cardIndex + 1} {card.title.trim() || 'Untitled card'}
                  </span>
                </p>
                <ul className={styles.question} aria-label="Conditions">
                  {questionLines.map((line, lineIndex) => (
                    <li key={lineIndex}>{line}</li>
                  ))}
                </ul>
                {runState !== 'skipped' && (
                  <span className={styles.stamp} data-match={isMatch}>
                    {isMatch ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
              <div className={styles.yesEdge} data-lit={isMatch} aria-hidden="true">
                <span>Yes</span>
              </div>
              <div className={styles.outcome} data-lit={isMatch}>
                <span className={styles.outcomeLabel}>Then</span>
                {card.then.trim() || '(no answer yet)'}
              </div>
            </div>
          </li>
        );
      })}

      <li className={styles.step} data-state={isFallbackReached ? 'match' : 'skipped'}>
        <Connector label={board.cards.length > 0 ? 'No' : undefined} isLit={isFallbackReached} />
        <div className={styles.fallback} data-lit={isFallbackReached}>
          <span className={styles.outcomeLabel}>Otherwise</span>
          {board.otherwise.trim() || '(no fallback answer yet)'}
        </div>
      </li>
    </ol>
  );
}

export default Flowchart;
