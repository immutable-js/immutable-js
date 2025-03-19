export default function invariant(
  condition: unknown,
  error: string
): asserts condition {
  if (!condition) throw new Error(error);
}
