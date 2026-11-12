import { useEffect, useId, useRef, useState } from 'react';
import { Button, Modal } from '@/shared/components';
import { classNames } from '@/lib/classNames';
import styles from './DonateModal.module.scss';

export const PAYPAL_EMAIL = 'renato.digital.crafts@gmail.com';

const PRESET_DOLLARS = [3, 5, 10, 25];

type CopyState = 'idle' | 'copied' | 'blocked';

export interface DonateModalProps {
  onClose: () => void;
}

function paypalDonateUrl(dollars: number): string {
  const params = new URLSearchParams({
    business: PAYPAL_EMAIL,
    amount: dollars.toFixed(2),
    currency_code: 'USD',
    item_name: 'Support Logeek',
  });
  return `https://www.paypal.com/donate/?${params}`;
}

function formatDollars(dollars: number): string {
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

/**
 * The offer to support the project, opened from the footer. Two routes to the
 * same PayPal account: a donation page with the amount already filled in, and
 * the address itself for anyone who would rather send from their own PayPal app.
 */
function DonateModal({ onClose }: DonateModalProps) {
  const [presetDollars, setPresetDollars] = useState(5);
  const [otherAmount, setOtherAmount] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const otherFieldId = useId();
  const emailFieldId = useId();

  const typedAmount = otherAmount.trim();
  // Much of the world writes seven and a half dollars as 7,50.
  const cents = typedAmount
    ? Math.round(Number(typedAmount.replace(',', '.')) * 100)
    : presetDollars * 100;
  const isAmountValid = Number.isFinite(cents) && cents > 0;
  const dollars = cents / 100;

  useEffect(() => {
    if (copyState !== 'copied') return;
    const resetTimer = window.setTimeout(() => setCopyState('idle'), 2000);
    return () => window.clearTimeout(resetTimer);
  }, [copyState]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PAYPAL_EMAIL);
      setCopyState('copied');
    } catch {
      // The clipboard API is missing outside a secure context and a browser
      // may refuse it. With the address selected, the copy shortcut still works.
      emailFieldRef.current?.focus();
      emailFieldRef.current?.select();
      setCopyState('blocked');
    }
  };

  return (
    <Modal
      title="Support Logeek"
      closeLabel="Close donation"
      onClose={onClose}
      className={styles.frame}
    >
      <div className={styles.body}>
        <div className={styles.lead}>
          <p className={styles.headline}>Keep Logeek free</p>
          <p className={styles.pitch}>
            No install, no account, no ads. A donation pays for the hours behind the next release.
          </p>
        </div>

        <div className={styles.amounts} role="group" aria-label="Amount in US dollars">
          {PRESET_DOLLARS.map((value) => {
            const isActive = !typedAmount && value === presetDollars;
            return (
              <button
                key={value}
                type="button"
                className={classNames(styles.amount, isActive && styles.amountActive)}
                aria-pressed={isActive}
                onClick={() => {
                  setPresetDollars(value);
                  setOtherAmount('');
                }}
              >
                {formatDollars(value)}
              </button>
            );
          })}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={otherFieldId}>
            Other amount in US dollars
          </label>
          <input
            id={otherFieldId}
            className={styles.input}
            inputMode="decimal"
            placeholder="0.00"
            autoComplete="off"
            value={otherAmount}
            onChange={(event) => setOtherAmount(event.target.value.replace(/[^\d.,]/g, ''))}
          />
        </div>

        <Button
          className={styles.donate}
          variant="primary"
          icon="heart"
          disabled={!isAmountValid}
          onClick={() => window.open(paypalDonateUrl(dollars), '_blank', 'noopener,noreferrer')}
        >
          {isAmountValid ? `Donate ${formatDollars(dollars)} with PayPal` : 'Enter an amount'}
        </Button>

        <div className={styles.direct}>
          <label className={styles.label} htmlFor={emailFieldId}>
            Or send any amount by PayPal to
          </label>
          <div className={styles.emailRow}>
            <input
              ref={emailFieldRef}
              id={emailFieldId}
              className={styles.input}
              value={PAYPAL_EMAIL}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />
            <Button
              icon={copyState === 'copied' ? 'check' : 'copy'}
              onClick={() => void copyEmail()}
            >
              {copyState === 'copied' ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className={styles.status} role="status">
            {copyState === 'blocked'
              ? 'The browser blocked copying, so the address is selected: press your copy shortcut.'
              : null}
          </p>
        </div>

        <p className={styles.fine}>
          PayPal takes the payment. Logeek never sees your card or account.
        </p>
      </div>
    </Modal>
  );
}

export default DonateModal;
