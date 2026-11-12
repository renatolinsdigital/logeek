import { useState } from 'react';
import logoUrl from '@/assets/logo.svg';
import { Button } from '@/shared/components';
import { DonateModal } from '../DonateModal';
import styles from './AppFooter.module.scss';

const AUTHOR_URL = 'https://www.linkedin.com/in/renatolinsdigital/';

/** The brand bar: the logo, the author credit and the offer to donate. */
function AppFooter() {
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <img className={styles.logo} src={logoUrl} alt="" width={28} height={40} />
        <p className={styles.credit}>
          Created by{' '}
          <a className={styles.link} href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
            Renato Lins
            <span className={styles.hiddenText}> (opens in a new tab)</span>
          </a>
        </p>
        <div className={styles.support}>
          <p className={styles.supportText}>Enjoying the app?</p>
          <Button variant="primary" size="sm" icon="heart" onClick={() => setIsDonateOpen(true)}>
            Donate
          </Button>
        </div>
      </div>
      {isDonateOpen && <DonateModal onClose={() => setIsDonateOpen(false)} />}
    </footer>
  );
}

export default AppFooter;
