import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Board } from '@/domain/models';
import { createExampleBoard, runBoard } from '@/domain/logic';
import Flowchart from './Flowchart';

function renderFlowchart(board: Board) {
  render(<Flowchart board={board} run={runBoard(board)} />);
  return screen.getByRole('list', { name: 'Decision flowchart' });
}

function getStepStates(flow: HTMLElement): Array<string | null> {
  return Array.from(flow.children, (step) => step.getAttribute('data-state'));
}

describe('Flowchart', () => {
  it('lights the path the test run took and dims what it never reached', () => {
    const flow = renderFlowchart(createExampleBoard());

    expect(getStepStates(flow)).toEqual(['match', 'miss', 'match', 'skipped', 'skipped']);
    expect(within(flow).getByText('Yes', { selector: '[data-match="true"]' })).toBeInTheDocument();
    expect(within(flow).getByText('No', { selector: '[data-match="false"]' })).toBeInTheDocument();
  });

  it('asks each card question line by line', () => {
    renderFlowchart(createExampleBoard());

    const bonusQuestion = screen.getAllByRole('list', { name: 'Conditions' })[2]!;
    expect(
      within(bonusQuestion)
        .getAllByRole('listitem')
        .map((line) => line.textContent),
    ).toEqual(['hasTicket is true', 'OR (country is "BR" AND coins > 10)']);
    expect(screen.getByText('#3 Bonus round')).toBeInTheDocument();
  });

  it('shows placeholders for blank text and lights the fallback when no card passes', () => {
    const flow = renderFlowchart({
      variables: [],
      otherwise: '',
      cards: [
        {
          id: 'card_blank',
          title: '',
          color: 'pink',
          then: '',
          when: { id: 'group_any', kind: 'group', match: 'any', items: [] },
        },
      ],
    });

    expect(getStepStates(flow)).toEqual(['match', 'miss', 'match']);
    expect(screen.getByText('#1 Untitled card')).toBeInTheDocument();
    expect(screen.getByText('never')).toBeInTheDocument();
    expect(screen.getByText('(no answer yet)')).toBeInTheDocument();
    expect(screen.getByText('(no fallback answer yet)')).toBeInTheDocument();
  });

  it('goes straight from start to the fallback on an empty board', () => {
    const flow = renderFlowchart({ variables: [], cards: [], otherwise: 'Wait' });

    expect(getStepStates(flow)).toEqual(['match', 'match']);
    expect(within(flow).queryByText('No')).not.toBeInTheDocument();
    expect(within(flow).getByText('Wait')).toBeInTheDocument();
  });
});
