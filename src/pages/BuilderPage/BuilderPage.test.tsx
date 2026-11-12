import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import { useToastStore } from '@/shared/components';
import BuilderPage from './BuilderPage';

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), lastRemovedCard: null });
  useToastStore.setState({ toasts: [] });
});

function getAnswer(): HTMLElement {
  return screen.getByText('Answer').closest('output') as HTMLElement;
}

describe('BuilderPage', () => {
  it('starts with three example cards and answers with the second one', () => {
    render(<BuilderPage />);

    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(within(getAnswer()).getByText('Join the night league')).toBeInTheDocument();
  });

  it('re-runs the flow when a test value changes', async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);

    const speedField = screen.getByRole('textbox', { name: 'speed' });
    await user.clear(speedField);
    await user.type(speedField, '150');

    expect(within(getAnswer()).getByText('Unlock the turbo boost')).toBeInTheDocument();
  });

  it('adds a variable and refuses a name already taken', async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);
    const nameField = screen.getByLabelText('New variable');

    await user.type(nameField, 'temperature');
    await user.click(screen.getByRole('button', { name: 'Add variable' }));
    expect(screen.getByDisplayValue('temperature')).toBeInTheDocument();

    await user.type(nameField, 'speed');
    await user.click(screen.getByRole('button', { name: 'Add variable' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'There is already a variable called speed.',
    );
    expect(nameField).toHaveAttribute('aria-invalid', 'true');
  });

  it('adds a new card with its title focused', async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);

    await user.click(screen.getByRole('button', { name: 'New card' }));

    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(screen.getByRole('textbox', { name: 'Title of card 4' })).toHaveFocus();
  });

  it('removes a card and brings it back with Undo', async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);
    const turboCard = screen.getByRole('article', { name: 'Card 1: Turbo mode' });

    await user.click(within(turboCard).getByRole('button', { name: 'Remove card' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('article', { name: 'Card 1: Turbo mode' })).toBeInTheDocument();
  });

  it('switches the JSON to JsonLogic', async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);
    const jsonRegion = screen.getByRole('region', { name: 'Board as logeek JSON' });
    expect(jsonRegion).toHaveTextContent('"decisions"');

    await user.click(screen.getByRole('button', { name: 'JsonLogic' }));

    const jsonLogicRegion = screen.getByRole('region', { name: 'Board as jsonlogic JSON' });
    expect(jsonLogicRegion).toHaveTextContent('"if"');
    expect(jsonLogicRegion).not.toHaveTextContent('"decisions"');
  });

  it('credits the author in a new tab', () => {
    render(<BuilderPage />);

    const authorLink = screen.getByRole('link', { name: /Renato Lins/ });
    expect(authorLink).toHaveAttribute('href', 'https://www.linkedin.com/in/renatolinsdigital/');
    expect(authorLink).toHaveAttribute('target', '_blank');
  });
});
