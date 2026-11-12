export type JsonTokenKind =
  'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'space';

export interface JsonToken {
  kind: JsonTokenKind;
  text: string;
}

const JSON_TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],:])|(\s+)/g;

/**
 * Splits text produced by `JSON.stringify` into coloured tokens, so it can be
 * highlighted as React elements instead of injected HTML.
 */
export function tokenizeJson(jsonText: string): JsonToken[] {
  const tokens: JsonToken[] = [];

  for (const match of jsonText.matchAll(JSON_TOKEN_PATTERN)) {
    const [, quotedText, keyColon, booleanText, nullText, numberText, punctuation, space] = match;

    if (quotedText !== undefined) {
      if (keyColon !== undefined) {
        tokens.push({ kind: 'key', text: quotedText });
        tokens.push({ kind: 'punctuation', text: keyColon });
      } else {
        tokens.push({ kind: 'string', text: quotedText });
      }
    } else if (booleanText !== undefined) {
      tokens.push({ kind: 'boolean', text: booleanText });
    } else if (nullText !== undefined) {
      tokens.push({ kind: 'null', text: nullText });
    } else if (numberText !== undefined) {
      tokens.push({ kind: 'number', text: numberText });
    } else if (punctuation !== undefined) {
      tokens.push({ kind: 'punctuation', text: punctuation });
    } else if (space !== undefined) {
      tokens.push({ kind: 'space', text: space });
    }
  }

  return tokens;
}
