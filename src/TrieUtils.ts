import type { Collection } from '../type-definitions/immutable';

// Constants describing the size of trie nodes.
export const SHIFT = 5; // Resulted in best performance after ______?
export const SIZE = 1 << SHIFT;
export const MASK = SIZE - 1;

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

export function ensureSize(iter: Collection<unknown, unknown>): number {
  // @ts-expect-error size should exists on Collection
  if (iter.size === undefined) {
    // @ts-expect-error size should exists on Collection, __iterate does exist on Collection
    iter.size = iter.__iterate(returnTrue);
  }
  // @ts-expect-error size should exists on Collection
  return iter.size;
}

export function wrapIndex(
  iter: Collection<unknown, unknown>,
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

export function wholeSlice(begin: number, end: number, size: number): boolean {
  return (
    ((begin === 0 && !isNeg(begin)) ||
      (size !== undefined && begin <= -size)) &&
    (end === undefined || (size !== undefined && end >= size))
  );
}

export function resolveBegin(begin: number, size: number): number {
  return resolveIndex(begin, size, 0);
}

export function resolveEnd(end: number, size: number): number {
  return resolveIndex(end, size, size);
}

function resolveIndex(
  index: number,
  size: number,
  defaultIndex: number
): number {
  // Sanitize indices using this shorthand for ToInt32(argument)
  // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
  return index === undefined
    ? defaultIndex
    : isNeg(index)
      ? size === Infinity
        ? size
        : Math.max(0, size + index) | 0
      : size === undefined || size === index
        ? index
        : Math.min(size, index) | 0;
}

function isNeg(value: number): boolean {
  // Account for -0 which is negative, but not less than 0.
  return value < 0 || (value === 0 && 1 / value === -Infinity);
}
