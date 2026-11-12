import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createExampleBoard } from '@/domain/logic';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import { useToastStore } from '@/shared/components';
import BuilderPage from './BuilderPage';

beforeEach(() => {
  useBoardStore.setState({
    ...createInitialBoardData(),
    ...createExampleBoard(),
    lastRemovedCard: null,
  });
  useToastStore.setState({ toasts: [] });
});

function getAnswer(): HTMLElement {
  return screen.getByText('Answer').closest('output') as HTMLElement;
}

describe('BuilderPage', () => {
  it('starts with no cards and loads the examples from the Examples button', async () => {
    const user = userEvent.setup();
    useBoardStore.setState({ ...createInitialBoardData(), lastRemovedCard: null });
    render(<BuilderPage />);
    expect(screen.queryAllByRole('article')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Examples' }));

    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByText('Example cards loaded.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('answers with the second example card', () => {
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

  it('rebuilds the cards from pasted Logeek JSON and brings the old board back with Undo', async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);
    const importedJson = JSON.stringify({
      variables: { score: 'number' },
      decisions: [
        {
          name: 'High score',
          if: { all: [{ variable: 'score', operator: '>', value: 90 }] },
          then: 'Gold',
        },
      ],
      otherwise: 'Try again',
    });

    await user.click(screen.getByRole('button', { name: 'Import' }));
    const dialog = screen.getByRole('dialog', { name: 'Import JSON' });
    const jsonField = within(dialog).getByLabelText('Logeek JSON');
    expect(jsonField).toHaveFocus();
    await user.click(jsonField);
    await user.paste(importedJson);
    await user.click(within(dialog).getByRole('button', { name: 'Import cards' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('article', { name: 'Card 1: High score' })).toBeInTheDocument();
    expect(screen.getByText('Imported 1 card from JSON.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('keeps the import open and says why when the JSON does not fit', async () => {
    const user = userEvent.setup();
    render(<BuilderPage />);

    await user.click(screen.getByRole('button', { name: 'Import' }));
    const dialog = screen.getByRole('dialog', { name: 'Import JSON' });
    await user.click(within(dialog).getByLabelText('Logeek JSON'));
    await user.paste('{ "if": [true, "Go", "Wait"] }');
    await user.click(within(dialog).getByRole('button', { name: 'Import cards' }));

    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Could not import: this is JsonLogic, which has no card names or variable types (copy the Logeek format instead).',
    );
    expect(within(dialog).getByLabelText('Logeek JSON')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByRole('article')).toHaveLength(3);

    await user.click(within(dialog).getByRole('button', { name: 'Close import' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('credits the author in a new tab', () => {
    render(<BuilderPage />);

    const authorLink = screen.getByRole('link', { name: /Renato Lins/ });
    expect(authorLink).toHaveAttribute('href', 'https://www.linkedin.com/in/renatolinsdigital/');
    expect(authorLink).toHaveAttribute('target', '_blank');
  });
});
