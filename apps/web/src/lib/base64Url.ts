/** Encodes any Unicode text as URL-safe base64, without padding. */
export function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binaryText = '';
  for (const byte of bytes) binaryText += String.fromCharCode(byte);
  return btoa(binaryText).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

/** Decodes what `encodeBase64Url` produced. Returns null for anything that is not valid base64url. */
export function decodeBase64Url(encodedText: string): string | null {
  if (!/^[A-Za-z0-9_-]*$/.test(encodedText)) return null;
  try {
    const base64Text = encodedText.replaceAll('-', '+').replaceAll('_', '/');
    const binaryText = atob(base64Text);
    const bytes = Uint8Array.from(binaryText, (character) => character.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}
