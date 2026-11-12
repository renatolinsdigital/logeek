import { describe, expect, it } from 'vitest';
import { decodeBase64Url, encodeBase64Url } from './base64Url';

describe('base64Url', () => {
  it('round trips Unicode text', () => {
    const text = 'Olá, jogador! ★ speed >= 100';

    expect(decodeBase64Url(encodeBase64Url(text))).toBe(text);
  });

  it('produces only URL-safe characters', () => {
    expect(encodeBase64Url('???>>>~~~')).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('returns null for text that is not base64url', () => {
    expect(decodeBase64Url('not base64!')).toBeNull();
  });
});
