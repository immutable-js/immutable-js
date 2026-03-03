export function isProtoKey(key) {
  return (
    typeof key === 'string' && (key === '__proto__' || key === 'constructor')
  );
}
