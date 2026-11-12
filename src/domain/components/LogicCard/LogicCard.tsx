import { useEffect, useId, useRef } from 'react';
import { Button, showToast } from '@/shared/components';
import type { LogicCard as LogicCardModel, Variable } from '@/domain/models';
import { describeCardTitle, type CardRunState } from '@/domain/logic';
import { useBoardStore } from '@/domain/store';
import { ConditionGroupEditor } from '../ConditionGroupEditor';
import styles from './LogicCard.module.scss';

export interface LogicCardProps {
  card: LogicCardModel;
  position: number;
  cardCount: number;
  variables: readonly Variable[];
  /** What the test run did with this card: passed it, failed it, or never reached it. */
  runState: CardRunState;
  /** Focuses the title once, for a card just added. */
  shouldFocusTitle?: boolean;
}

const RUN_STATE_TEXT: Record<CardRunState, string> = {
  match: 'Test run: passes, this card answers',
  miss: 'Test run: does not pass',
  skipped: 'Test run: not reached',
};

/** One decision card: a title, its IF conditions and its THEN answer. */
function LogicCard({
  card,
  position,
  cardCount,
  variables,
  runState,
  shouldFocusTitle = false,
}: LogicCardProps) {
  const updateCard = useBoardStore((state) => state.updateCard);
  const moveCard = useBoardStore((state) => state.moveCard);
  const cycleCardColor = useBoardStore((state) => state.cycleCardColor);
  const duplicateCard = useBoardStore((state) => state.duplicateCard);
  const removeCard = useBoardStore((state) => state.removeCard);
  const restoreRemovedCard = useBoardStore((state) => state.restoreRemovedCard);
  const articleRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const thenId = useId();
  const displayTitle = describeCardTitle(card);

  useEffect(() => {
    if (!shouldFocusTitle) return;
    articleRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    titleRef.current?.focus({ preventScroll: true });
    titleRef.current?.select();
  }, [shouldFocusTitle]);

  const handleRemove = () => {
    removeCard(card.id);
    showToast(`Card "${displayTitle}" removed.`, {
      action: { label: 'Undo', onAction: restoreRemovedCard },
    });
  };

  return (
    <article
      ref={articleRef}
      className={styles.card}
      data-color={card.color}
      aria-label={`Card ${position}: ${displayTitle}`}
    >
      <header className={styles.header}>
        <span className={styles.number} aria-hidden="true">
          #{position}
        </span>
        <input
          ref={titleRef}
          className={styles.title}
          value={card.title}
          placeholder="Name this card"
          aria-label={`Title of card ${position}`}
          maxLength={80}
          spellCheck={false}
          onChange={(event) => updateCard(card.id, { title: event.target.value })}
        />
      </header>

      <div className={styles.tools}>
        <Button
          variant="ghost"
          size="sm"
          icon="arrowLeft"
          label="Check this card earlier"
          disabled={position === 1}
          onClick={() => moveCard(card.id, -1)}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="arrowRight"
          label="Check this card later"
          disabled={position === cardCount}
          onClick={() => moveCard(card.id, 1)}
        />
        <span className={styles.toolsSpacer} />
        <Button
          variant="ghost"
          size="sm"
          icon="paint"
          label="Change colour"
          onClick={() => cycleCardColor(card.id)}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="copy"
          label="Duplicate card"
          onClick={() => duplicateCard(card.id)}
        />
        <Button variant="ghost" size="sm" icon="trash" label="Remove card" onClick={handleRemove} />
      </div>

      <div className={styles.body}>
        <ConditionGroupEditor cardId={card.id} group={card.when} variables={variables} isRoot />

        <div className={styles.then}>
          <label className={styles.thenLabel} htmlFor={thenId}>
            Then
          </label>
          <input
            id={thenId}
            className={styles.thenInput}
            value={card.then}
            placeholder="What happens? e.g. Show the promo"
            maxLength={120}
            onChange={(event) => updateCard(card.id, { then: event.target.value })}
          />
        </div>
      </div>

      <footer className={styles.footer} data-run={runState}>
        <span className={styles.runDot} aria-hidden="true" />
        {RUN_STATE_TEXT[runState]}
      </footer>
    </article>
  );
}

export default LogicCard;
