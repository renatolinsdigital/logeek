import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createExampleBoard } from '@/domain/logic';
import { createInitialBoardData, useBoardStore } from '@/domain/store';
import FlowchartPanel from './FlowchartPanel';

function getAnswer(): HTMLElement {
  return screen.getByText('Answer').closest('output') as HTMLElement;
}

beforeEach(() => {
  useBoardStore.setState({ ...createInitialBoardData(), ...createExampleBoard() });
});

describe('FlowchartPanel', () => {
  it('names the card that answered', () => {
    render(<FlowchartPanel />);

    expect(getAnswer()).toHaveTextContent('Join the night league');
    expect(getAnswer()).toHaveTextContent('from card #2, Night league');
  });

  it('names an untitled card that answered', () => {
    const board = createExampleBoard();
    board.cards[1]!.title = ' ';
    useBoardStore.setState({ ...board });
    render(<FlowchartPanel />);

    expect(getAnswer()).toHaveTextContent('from card #2, Untitled card');
  });

  it('says when the fallback answers, or that there is no answer yet', () => {
    useBoardStore.setState({ cards: [], otherwise: '' });
    render(<FlowchartPanel />);

    expect(getAnswer()).toHaveTextContent('(no answer yet)');
    expect(getAnswer()).toHaveTextContent('no card passed, so the fallback answers');
  });
});
