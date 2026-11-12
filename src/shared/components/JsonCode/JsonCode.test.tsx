import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import JsonCode from './JsonCode';

describe('JsonCode', () => {
  it('shows the JSON exactly, in a focusable region named by its label', () => {
    const jsonText = JSON.stringify({ name: 'Turbo', speed: 100, isOn: true, note: null }, null, 2);
    render(<JsonCode jsonText={jsonText} label="Board as JSON" />);

    const region = screen.getByRole('region', { name: 'Board as JSON' });
    expect(region.textContent).toBe(jsonText);
    expect(region).toHaveAttribute('tabindex', '0');
  });

  it('colours keys and values as text, never as injected markup', () => {
    render(<JsonCode jsonText={'{"tag":"<b>hi</b>","count":2}'} label="JSON" />);

    expect(screen.getByText('"tag"')).toHaveClass('key');
    expect(screen.getByText('"<b>hi</b>"')).toHaveClass('string');
    expect(screen.getByText('2')).toHaveClass('number');
    expect(screen.getByRole('region').querySelector('b')).toBeNull();
  });
});
