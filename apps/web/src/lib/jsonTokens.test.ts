import { describe, expect, it } from 'vitest';
import { tokenizeJson } from './jsonTokens';

describe('tokenizeJson', () => {
  it('tells keys apart from string values', () => {
    const tokens = tokenizeJson('{"name":"Turbo"}');

    expect(tokens).toEqual([
      { kind: 'punctuation', text: '{' },
      { kind: 'key', text: '"name"' },
      { kind: 'punctuation', text: ':' },
      { kind: 'string', text: '"Turbo"' },
      { kind: 'punctuation', text: '}' },
    ]);
  });

  it('recognises numbers, booleans and null', () => {
    const kinds = tokenizeJson('[-1.5, true, false, null, 2e3]')
      .filter((token) => token.kind !== 'punctuation' && token.kind !== 'space')
      .map((token) => token.kind);

    expect(kinds).toEqual(['number', 'boolean', 'boolean', 'null', 'number']);
  });

  it('keeps escaped quotes inside one string token', () => {
    const tokens = tokenizeJson('["say \\"hi\\""]');

    expect(tokens[1]).toEqual({ kind: 'string', text: '"say \\"hi\\""' });
  });

  it('loses no characters, so the joined tokens equal the input', () => {
    const jsonText = JSON.stringify({ a: [1, { b: 'c d' }], e: null }, null, 2);

    expect(
      tokenizeJson(jsonText)
        .map((token) => token.text)
        .join(''),
    ).toBe(jsonText);
  });
});
