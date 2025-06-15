import arrCopy from './arrCopy';
import hasOwnProperty from './hasOwnProperty';

export default function shallowCopy<I>(from: Array<I>): Array<I>;
export default function shallowCopy<O extends object>(from: O): O;
export default function shallowCopy<I, O extends object>(
  from: Array<I> | O
): Array<I> | O {
  if (Array.isArray(from)) {
    return arrCopy(from);
  }
  const to: Partial<O> = {};
  for (const key in from) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  return to as O;
}
