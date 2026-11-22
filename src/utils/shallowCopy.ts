import arrCopy from './arrCopy';
import hasOwnProperty from './hasOwnProperty';
import { isProtoKey } from './protoInjection';

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
    if (isProtoKey(key)) {
      continue;
    }

    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  // Own enumerable symbol keys are not visited by for...in; preserve them
  // so functional set/remove/update do not drop unrelated symbols (#2289).
  if (typeof Object.getOwnPropertySymbols === 'function') {
    const symbols = Object.getOwnPropertySymbols(from);
    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i];
      if (Object.prototype.propertyIsEnumerable.call(from, sym)) {
        // @ts-expect-error symbol index
        to[sym] = from[sym];
      }
    }
  }
  return to as O;
}
