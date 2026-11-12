import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Panel from './Panel';

describe('Panel', () => {
  it('is a region named by its heading, with its eyebrow, description and actions', () => {
    render(
      <Panel
        eyebrow="Stage 1"
        title="Variables"
        description="The facts your system knows."
        actions={<button type="button">JSON</button>}
        tone="crt"
        className="extra"
      >
        <p>Body</p>
      </Panel>,
    );

    const region = screen.getByRole('region', { name: 'Variables' });
    expect(region).toHaveClass('panel', 'crt', 'extra');
    expect(screen.getByRole('heading', { level: 2, name: 'Variables' })).toBeInTheDocument();
    expect(region).toHaveTextContent('Stage 1');
    expect(region).toHaveTextContent('The facts your system knows.');
    expect(screen.getByRole('button', { name: 'JSON' })).toBeInTheDocument();
    expect(region).toHaveTextContent('Body');
  });

  it('leaves out the optional parts it was not given', () => {
    const { container } = render(
      <Panel title="Plain">
        <p>Body</p>
      </Panel>,
    );

    expect(screen.getByRole('region', { name: 'Plain' })).toHaveClass('paper');
    expect(container.querySelector('.eyebrow, .description, .actions')).toBeNull();
  });
});
