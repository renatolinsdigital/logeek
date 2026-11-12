import { describe, expect, it } from 'vitest';
import { CARD_COLORS } from '@/domain/models';
import { createExampleBoard } from './examples';
import { toLogeekJson } from './exportJson';
import { parseLogeekJson } from './importJson';

function nestGroups(levels: number): unknown {
  let node: unknown = { variable: 'speed', operator: '>', value: 1 };
  for (let level = 0; level < levels; level += 1) node = { all: [node] };
  return node;
}

function documentWith(decisionIf: unknown): string {
  return JSON.stringify({
    variables: { speed: 'number' },
    decisions: [{ name: 'Fast', if: decisionIf, then: 'Go' }],
    otherwise: 'Wait',
  });
}

describe('parseLogeekJson', () => {
  it('rebuilds the cards from the JSON the panel exports, pretty or compact', () => {
    const exportedDocument = toLogeekJson(createExampleBoard());

    for (const jsonText of [
      JSON.stringify(exportedDocument, null, 2),
      JSON.stringify(exportedDocument),
    ]) {
      const { board, error } = parseLogeekJson(jsonText);
      expect(error).toBeNull();
      expect(toLogeekJson(board!)).toEqual(exportedDocument);
    }
  });

  it('colours the cards in palette order and starts test values at their defaults', () => {
    const { board } = parseLogeekJson(JSON.stringify(toLogeekJson(createExampleBoard())));

    expect(board!.cards.map((card) => card.color)).toEqual(CARD_COLORS.slice(0, 3));
    expect(board!.variables.find((variable) => variable.name === 'speed')?.sample).toBe('0');
    expect(board!.variables.find((variable) => variable.name === 'hasTicket')?.sample).toBe('true');
  });

  it('keeps values as typed text, with null as an empty value', () => {
    const { board } = parseLogeekJson(
      JSON.stringify({
        variables: { speed: 'number', hasTicket: 'boolean' },
        decisions: [
          {
            name: 'Mixed',
            if: {
              any: [
                { variable: 'speed', operator: '>=', value: 100.5 },
                { variable: 'speed', operator: '<', value: null },
                { variable: 'hasTicket', operator: '==', value: false },
              ],
            },
            then: 'Yes',
          },
        ],
        otherwise: 'No',
      }),
    );

    const rootGroup = board!.cards[0]!.when;
    expect(rootGroup.match).toBe('any');
    expect(rootGroup.items.map((item) => (item.kind === 'condition' ? item.value : null))).toEqual([
      '100.5',
      '',
      'false',
    ]);
  });

  it('accepts a single condition as a decision of one', () => {
    const { board } = parseLogeekJson(
      documentWith({ variable: 'speed', operator: '>', value: 100 }),
    );

    expect(board!.cards[0]!.when).toMatchObject({ kind: 'group', match: 'all' });
    expect(board!.cards[0]!.when.items).toHaveLength(1);
  });

  it('says why it refuses JSON that does not describe a board', () => {
    const cases: Array<[string, string]> = [
      ['{ "variables": ', 'this is not valid JSON'],
      ['[1, 2]', 'the JSON must be an object with variables and decisions'],
      [
        JSON.stringify({ if: [true, 'Go', 'Wait'] }),
        'this is JsonLogic, which has no card names or variable types (copy the Logeek format instead)',
      ],
      [documentWith({ all: [], any: [] }), 'a group must hold either all or any, not both'],
      [documentWith({ all: 'speed' }), 'all must be a list'],
      [
        documentWith({ all: [{ variable: 'age', operator: '>', value: 1 }] }),
        'a condition points at a missing variable',
      ],
      [
        documentWith({ all: [{ variable: 'speed', operator: 'contains', value: 1 }] }),
        'operator contains does not fit speed',
      ],
      [
        JSON.stringify({ variables: { speed: 'date' }, decisions: [], otherwise: '' }),
        'unknown type for speed',
      ],
      [
        JSON.stringify({ variables: { speed: 'number' }, decisions: {}, otherwise: '' }),
        'decisions must be a list',
      ],
      [
        JSON.stringify({ variables: ['speed'], decisions: [], otherwise: '' }),
        'variables must be an object of names and types',
      ],
      [
        JSON.stringify({ variables: { speed: 'number' }, decisions: ['Fast'], otherwise: '' }),
        'a decision must be an object',
      ],
      [
        JSON.stringify({
          variables: { speed: 'number' },
          decisions: [{ name: 'Fast', then: 'Go' }],
          otherwise: '',
        }),
        'decision 1 has no if',
      ],
      [documentWith({ any: ['speed'] }), 'a condition must be an object'],
      [
        JSON.stringify({
          variables: { speed: 'number' },
          decisions: [{ name: 'Fast', if: { all: [] }, then: 'Go' }],
        }),
        'otherwise must be text of 300 characters or fewer',
      ],
    ];

    for (const [jsonText, expectedError] of cases) {
      expect(parseLogeekJson(jsonText)).toEqual({ board: null, error: expectedError });
    }
  });

  it('refuses groups nested past four levels', () => {
    expect(parseLogeekJson(documentWith(nestGroups(4))).error).toBeNull();
    expect(parseLogeekJson(documentWith(nestGroups(5))).error).toBe('groups are nested too deep');
  });
});
