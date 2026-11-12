import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppFooter } from '../AppFooter';
import DonateModal, { PAYPAL_EMAIL } from './DonateModal';

/** The PayPal page the donate button opened, read back as its query. */
function openedQuery(openSpy: { mock: { calls: unknown[][] } }): URLSearchParams {
  return new URL(openSpy.mock.calls[0]?.[0] as string).searchParams;
}

describe('DonateModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens from the Donate button in the footer and closes again', async () => {
    const user = userEvent.setup();
    render(<AppFooter />);

    await user.click(screen.getByRole('button', { name: 'Donate' }));
    expect(screen.getByRole('dialog', { name: 'Support Logeek' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close donation' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the PayPal donation page with the picked amount', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<DonateModal onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: '$10' }));
    await user.click(screen.getByRole('button', { name: 'Donate $10 with PayPal' }));

    const query = openedQuery(openSpy);
    expect(query.get('business')).toBe(PAYPAL_EMAIL);
    expect(query.get('amount')).toBe('10.00');
    expect(query.get('currency_code')).toBe('USD');
    expect(query.get('item_name')).toBe('Support Logeek');
  });

  it('lets a typed amount, comma decimals included, override the presets', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<DonateModal onClose={() => {}} />);

    await user.type(screen.getByLabelText('Other amount in US dollars'), '7,5');

    expect(screen.getByRole('button', { name: '$5' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'Donate $7.50 with PayPal' }));
    expect(openedQuery(openSpy).get('amount')).toBe('7.50');
  });

  it('refuses an amount of zero', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<DonateModal onClose={() => {}} />);

    await user.type(screen.getByLabelText('Other amount in US dollars'), '0');

    expect(screen.getByRole('button', { name: 'Enter an amount' })).toBeDisabled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('copies the PayPal address', async () => {
    const user = userEvent.setup();
    render(<DonateModal onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await expect(navigator.clipboard.readText()).resolves.toBe(PAYPAL_EMAIL);
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('selects the address for a manual copy when the browser blocks copying', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    render(<DonateModal onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    const emailField = screen.getByLabelText('Or send any amount by PayPal to');
    expect(emailField).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(
      'The browser blocked copying, so the address is selected: press your copy shortcut.',
    );
  });

  it('closes when the donation is dismissed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<DonateModal onClose={handleClose} />);

    await user.click(screen.getByRole('button', { name: 'Close donation' }));

    expect(handleClose).toHaveBeenCalledOnce();
  });
});
