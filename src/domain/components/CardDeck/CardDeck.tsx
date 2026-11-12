import { useId, useMemo, useState } from 'react';
import { Button, Panel, PixelIcon } from '@/shared/components';
import { getCardRunState, runBoard } from '@/domain/logic';
import { useBoard, useBoardStore } from '@/domain/store';
import { JsonModal } from '../JsonModal';
import { LogicCard } from '../LogicCard';
import styles from './CardDeck.module.scss';

/**
 * Stage 2: the cards, checked in order, then the fallback answer and the
 * button for a new card. Its JSON button opens the cards as JSON, both ways.
 */
function CardDeck() {
  const board = useBoard();
  const addCard = useBoardStore((state) => state.addCard);
  const setOtherwise = useBoardStore((state) => state.setOtherwise);
  const [newCardId, setNewCardId] = useState<string | null>(null);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const run = useMemo(() => runBoard(board), [board]);
  const otherwiseId = useId();

  return (
    <Panel
      eyebrow="Stage 2"
      title="Logic cards"
      description="Cards are checked from first to last. The first card whose conditions pass gives the answer; if none does, the fallback answers."
      actions={
        <Button icon="braces" onClick={() => setIsJsonOpen(true)}>
          JSON
        </Button>
      }
    >
      <ol className={styles.deck}>
        {board.cards.map((card, cardIndex) => (
          <li key={card.id} className={styles.slot}>
            <LogicCard
              card={card}
              position={cardIndex + 1}
              cardCount={board.cards.length}
              variables={board.variables}
              runState={getCardRunState(run, card.id)}
              shouldFocusTitle={card.id === newCardId}
            />
          </li>
        ))}

        <li className={styles.slot}>
          <div className={styles.otherwise} data-active={run.matchedCardId === null}>
            <label className={styles.otherwiseLabel} htmlFor={otherwiseId}>
              Otherwise
            </label>
            <p className={styles.otherwiseHint}>When no card passes, the answer is:</p>
            <input
              id={otherwiseId}
              className={styles.otherwiseInput}
              value={board.otherwise}
              placeholder="e.g. Do nothing"
              maxLength={120}
              onChange={(event) => setOtherwise(event.target.value)}
            />
          </div>
        </li>

        <li className={styles.slot}>
          <button type="button" className={styles.newCard} onClick={() => setNewCardId(addCard())}>
            <PixelIcon name="plus" size={40} />
            <span>New card</span>
          </button>
        </li>
      </ol>
      {isJsonOpen && <JsonModal onClose={() => setIsJsonOpen(false)} />}
    </Panel>
  );
}

export default CardDeck;
