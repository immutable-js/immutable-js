export default function arrCopy<I>(arr: Array<I>, offset = 0): Array<I> {
  return arr.slice(offset);
}
