import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('names an icon-only button by its label and shows the label as a tooltip', () => {
    render(<Button icon="trash" label="Remove card" />);

    const button = screen.getByRole('button', { name: 'Remove card' });
    expect(button).toHaveAttribute('title', 'Remove card');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('button', 'secondary', 'md', 'iconOnly');
  });

  it('names a button with text by its text, keeping the label as a tooltip only', () => {
    render(
      <Button variant="danger" size="sm" icon="trash" label="Empties the board">
        Clear
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Clear' });
    expect(button).not.toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title', 'Empties the board');
    expect(button).toHaveClass('danger', 'sm');
    expect(button).not.toHaveClass('iconOnly');
  });

  it('passes the type, class name and handlers through', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button type="submit" className="extra" onClick={handleClick}>
        Send
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(handleClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('button')).toHaveClass('extra');
  });
});
