// taken from https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa#unicode_strings
function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m: string) => m.codePointAt(0) ?? 0);
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join('');
  return btoa(binString);
}

export function stringToBytes(str: string): string {
  return bytesToBase64(new TextEncoder().encode(str));
}

export function bytesToString(bytes: string): string {
  return new TextDecoder().decode(base64ToBytes(bytes));
}
