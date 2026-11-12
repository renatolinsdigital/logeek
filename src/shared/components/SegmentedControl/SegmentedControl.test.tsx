import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SegmentedControl from './SegmentedControl';

const SPEED_OPTIONS = [
  { value: 'slow', label: 'Slow' },
  { value: 'fast', label: 'Fast' },
] as const;

describe('SegmentedControl', () => {
  it('is a group named by its legend with exactly the current option pressed', () => {
    render(
      <SegmentedControl legend="Speed" options={SPEED_OPTIONS} value="fast" onChange={() => {}} />,
    );

    expect(screen.getByRole('group', { name: 'Speed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Slow' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Fast' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('reports the option picked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        legend="Speed"
        options={SPEED_OPTIONS}
        value="fast"
        onChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Slow' }));

    expect(handleChange).toHaveBeenCalledWith('slow');
  });

  it('hides its legend visually unless asked to show it', () => {
    const { rerender } = render(
      <SegmentedControl legend="Speed" options={SPEED_OPTIONS} value="fast" onChange={() => {}} />,
    );
    expect(screen.getByText('Speed')).toHaveClass('hiddenLegend');

    rerender(
      <SegmentedControl
        legend="Speed"
        options={SPEED_OPTIONS}
        value="fast"
        onChange={() => {}}
        isLegendVisible
        tone="crt"
        size="sm"
      />,
    );
    expect(screen.getByText('Speed')).toHaveClass('legend');
    expect(screen.getByRole('group')).toHaveClass('fieldset', 'crt', 'sm');
  });
});
