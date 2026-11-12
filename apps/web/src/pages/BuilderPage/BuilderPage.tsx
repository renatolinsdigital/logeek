import { ToastViewport } from '@/shared/components';
import {
  AppFooter,
  AppHeader,
  CardDeck,
  FlowchartPanel,
  JsonPanel,
  VariablesPanel,
} from '@/domain/components';
import { useLoadSharedBoard } from '@/domain/hooks';
import styles from './BuilderPage.module.scss';

/** The one screen: variables, cards, then the flowchart and the JSON side by side on wide screens. */
function BuilderPage() {
  useLoadSharedBoard();

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.main}>
        <VariablesPanel />
        <CardDeck />
        <div className={styles.outputs}>
          <FlowchartPanel />
          <JsonPanel />
        </div>
      </main>
      <AppFooter />
      <ToastViewport dismissLabel="Dismiss message" />
    </div>
  );
}

export default BuilderPage;
