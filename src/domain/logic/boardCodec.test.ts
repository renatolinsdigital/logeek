import { describe, expect, it } from 'vitest';
import { BOARD_LIMITS, checkBoard, decodeBoard, encodeBoard, parseBoard } from './boardCodec';
import { createExampleBoard } from './examples';
import { toLogeekJson } from './exportJson';

describe('boardCodec', () => {
  it('round trips a board through a share link with the same logic', () => {
    const board = createExampleBoard();

    const decodedBoard = decodeBoard(encodeBoard(board));

    expect(decodedBoard).not.toBeNull();
    expect(toLogeekJson(decodedBoard!)).toEqual(toLogeekJson(board));
    expect(decodedBoard!.variables.map((variable) => variable.sample)).toEqual(
      board.variables.map((variable) => variable.sample),
    );
  });

  it('gives every node a fresh id', () => {
    const board = createExampleBoard();

    const parsedBoard = parseBoard(board);

    expect(parsedBoard?.cards[0]?.id).not.toBe(board.cards[0]?.id);
  });

  it('refuses a condition pointing at a missing variable', () => {
    const board = createExampleBoard();

    expect(parseBoard({ ...board, variables: board.variables.slice(1) })).toBeNull();
  });

  it('refuses an operator that does not fit the variable type', () => {
    const board = createExampleBoard();
    const brokenBoard = JSON.parse(JSON.stringify(board));
    brokenBoard.cards[0].when.items[0].operator = 'contains';

    expect(parseBoard(brokenBoard)).toBeNull();
  });

  it('refuses repeated variable names and garbage', () => {
    const board = createExampleBoard();
    const [firstVariable] = board.variables;

    expect(parseBoard({ ...board, variables: [...board.variables, firstVariable] })).toBeNull();
    expect(parseBoard('hello')).toBeNull();
    expect(decodeBoard('%%%')).toBeNull();
    expect(decodeBoard('aGVsbG8')).toBeNull();
  });
});

describe('checkBoard', () => {
  function boardWith(changes: Record<string, unknown>): Record<string, unknown> {
    return { ...JSON.parse(JSON.stringify(createExampleBoard())), ...changes };
  }

  function nestGroups(levels: number, speedVariableId: string): unknown {
    let node: unknown = {
      kind: 'condition',
      variableId: speedVariableId,
      operator: '>',
      value: '1',
    };
    for (let level = 0; level < levels; level += 1) {
      node = { kind: 'group', match: 'all', items: [node] };
    }
    return node;
  }

  it('says the first thing that does not fit', () => {
    const board = createExampleBoard();
    const longText = 'x'.repeat(BOARD_LIMITS.textLength + 1);
    const cases: Array<[unknown, string]> = [
      [null, 'a board must be an object'],
      [boardWith({ variables: {} }), 'variables must be a list of 60 items or fewer'],
      [boardWith({ variables: ['speed'] }), 'a variable must be an object'],
      [boardWith({ otherwise: longText }), 'otherwise must be text of 300 characters or fewer'],
      [boardWith({ cards: [42] }), 'a card must be an object'],
      [
        boardWith({ cards: new Array(BOARD_LIMITS.cards + 1).fill(board.cards[0]) }),
        'cards must be a list of 120 items or fewer',
      ],
      [
        boardWith({ variables: [{ id: 'v', name: '9lives', type: 'number' }], cards: [] }),
        'variable name 9lives is invalid or repeated',
      ],
      [
        boardWith({
          cards: [{ ...board.cards[0], when: { ...board.cards[0]!.when, match: 'some' } }],
        }),
        'a group must match all or any',
      ],
      [
        boardWith({
          cards: [{ ...board.cards[0], when: { ...board.cards[0]!.when, items: ['x'] } }],
        }),
        'a condition must be an object',
      ],
    ];

    for (const [input, expectedError] of cases) {
      expect(checkBoard(input)).toEqual({ board: null, error: expectedError });
    }
  });

  it('refuses groups nested past four levels', () => {
    const board = createExampleBoard();
    const speedId = board.variables[0]!.id;
    const cardWithDepth = (levels: number) => ({
      ...board.cards[0],
      when: nestGroups(levels, speedId),
    });

    const { variables } = board;

    expect(checkBoard(boardWith({ variables, cards: [cardWithDepth(4)] })).error).toBeNull();
    expect(checkBoard(boardWith({ variables, cards: [cardWithDepth(5)] })).error).toBe(
      'groups are nested too deep or malformed',
    );
  });

  it('paints a card of an unknown colour pink and gives a variable with no test value an empty one', () => {
    const board = createExampleBoard();
    const [firstVariable] = board.variables;
    const { sample: _sample, ...variableWithoutSample } = firstVariable!;

    const checkedBoard = parseBoard(
      boardWith({
        variables: [variableWithoutSample, ...board.variables.slice(1)],
        cards: [{ ...board.cards[1], color: 'gold' }],
      }),
    );

    expect(checkedBoard?.cards[0]?.color).toBe('pink');
    expect(checkedBoard?.variables[0]?.sample).toBe('');
  });
});
