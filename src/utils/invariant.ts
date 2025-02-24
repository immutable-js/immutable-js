export default function invariant(
  condition: boolean,
  error: string
): asserts condition is true {
  if (!condition) throw new Error(error);
}
