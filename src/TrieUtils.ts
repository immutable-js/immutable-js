import type { CollectionImpl } from './Collection';

// Used for setting prototype methods that IE8 chokes on.
export const DELETE = 'delete';

// Constants describing the size of trie nodes.
export const SHIFT = 5; // Resulted in best performance after ______?
export const SIZE = 1 << SHIFT;
export const MASK = SIZE - 1;

// A consistent shared value representing "not set" which equals nothing other
// than itself, and nothing that could be provided externally.
export const NOT_SET = {};

type Ref = { value: boolean };

// Boolean references, Rough equivalent of `bool &`.
export function MakeRef(): Ref {
  return { value: false };
}

export function SetRef(ref: Ref): void {
  if (ref) {
    ref.value = true;
  }
}

// A function which returns a value representing an "owner" for transient writes
// to tries. The return value will only ever equal itself, and will not equal
// the return of any subsequent call of this function.
export function OwnerID() {}

export function ensureSize(iter: CollectionImpl<unknown, unknown>): number {
  if (iter.size === undefined) {
    // Materialize the size; the assignment yields the freshly counted `number`.
    return (iter.size = iter.__iterate(returnTrue));
  }

  return iter.size;
}

export function wrapIndex(
  iter: CollectionImpl<unknown, unknown>,
  index: number
): number {
  // This implements "is array index" which the ECMAString spec defines as:
  //
  //     A String property name P is an array index if and only if
  //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
  //     to 2^32−1.
  //
  // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
  if (typeof index !== 'number') {
    const uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
    if ('' + uint32Index !== index || uint32Index === 4294967295) {
      return NaN;
    }
    index = uint32Index;
  }
  return index < 0 ? ensureSize(iter) + index : index;
}

export function returnTrue(): true {
  return true;
}

export function wholeSlice(
  begin: number | undefined,
  end: number | undefined,
  size: number | undefined
): boolean {
  return (
    ((begin === 0 && !isNeg(begin)) ||
      (size !== undefined && (begin ?? 0) <= -size)) &&
    (end === undefined || (size !== undefined && end >= size))
  );
}

export function resolveBegin(
  begin: number | undefined,
  size: number | undefined
): number {
  return resolveIndex(begin, size, 0);
}

// With a known `size` the end always resolves to a number. With an unknown size
// and no explicit `end`, the end stays `undefined` (the slice runs to the —
// not-yet-known — end of the sequence).
export function resolveEnd(end: number | undefined, size: number): number;
export function resolveEnd(
  end: number | undefined,
  size: number | undefined
): number | undefined;
export function resolveEnd(
  end: number | undefined,
  size: number | undefined
): number | undefined {
  return resolveIndex(end, size, size);
}

function resolveIndex(
  index: number | undefined,
  size: number | undefined,
  defaultIndex: number
): number;
function resolveIndex(
  index: number | undefined,
  size: number | undefined,
  defaultIndex: number | undefined
): number | undefined;
function resolveIndex(
  index: number | undefined,
  size: number | undefined,
  defaultIndex: number | undefined
): number | undefined {
  // Sanitize indices using this shorthand for ToInt32(argument)
  // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
  return index === undefined
    ? defaultIndex
    : isNeg(index)
      ? size === Infinity
        ? size
        : Math.max(0, (size ?? 0) + index) | 0
      : size === undefined || size === index
        ? index
        : Math.min(size, index) | 0;
}

function isNeg(value: number): boolean {
  // Account for -0 which is negative, but not less than 0.
  return value < 0 || (value === 0 && 1 / value === -Infinity);
}
