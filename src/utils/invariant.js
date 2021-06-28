export default function invariant(condition, error) {
  if (!condition) throw new Error(error);
}
