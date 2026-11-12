import { ToastViewport } from '@/shared/components';
import {
  AppFooter,
  AppHeader,
  CardDeck,
  FlowchartPanel,
  VariablesPanel,
} from '@/domain/components';
import { useLoadSharedBoard } from '@/domain/hooks';
import styles from './BuilderPage.module.scss';

/** The one screen: variables, cards, then the flowchart across the whole width. */
function BuilderPage() {
  useLoadSharedBoard();

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.main}>
        <VariablesPanel />
        <CardDeck />
        <FlowchartPanel />
      </main>
      <AppFooter />
      <ToastViewport dismissLabel="Dismiss message" />
    </div>
  );
}

export default BuilderPage;
