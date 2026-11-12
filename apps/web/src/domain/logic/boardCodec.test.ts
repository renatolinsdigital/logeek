import { describe, expect, it } from 'vitest';
import { decodeBoard, encodeBoard, parseBoard } from './boardCodec';
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
