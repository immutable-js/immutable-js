export function isProtoKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor';
}
