import logoUrl from '@/assets/logo.svg';
import styles from './AppFooter.module.scss';

const AUTHOR_URL = 'https://www.linkedin.com/in/renatolinsdigital/';

/** The brand bar: the logo and the author credit. */
function AppFooter() {
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
        <p className={styles.gameOver} aria-hidden="true">
          Game over? Press start
        </p>
      </div>
    </footer>
  );
}

export default AppFooter;
