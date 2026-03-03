export function isProtoKey(key: unknown): boolean {
  return (
    typeof key === 'string' && (key === '__proto__' || key === 'constructor')
  );
}
