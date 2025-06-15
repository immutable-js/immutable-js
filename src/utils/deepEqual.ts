import type { Collection } from '../../type-definitions/immutable';
import type { Range } from '../Range';
import type { Repeat } from '../Repeat';
import { NOT_SET } from '../const';
import {
  probeIsAssociative,
  probeIsCollection,
  probeIsIndexed,
  probeIsKeyed,
  probeIsOrdered,
  probeIsSame,
} from '../probe';

export default function deepEqual(
  a: typeof Range | typeof Repeat | Collection<unknown, unknown>,
  b: unknown
): boolean {
  if (a === b) {
    return true;
  }

  if (
    !probeIsCollection(b) ||
    // @ts-expect-error size should exists on Collection
    (a.size !== undefined && b.size !== undefined && a.size !== b.size) ||
    // @ts-expect-error __hash exists on Collection
    (a.__hash !== undefined &&
      // @ts-expect-error __hash exists on Collection
      b.__hash !== undefined &&
      // @ts-expect-error __hash exists on Collection
      a.__hash !== b.__hash) ||
    probeIsKeyed(a) !== probeIsKeyed(b) ||
    probeIsIndexed(a) !== probeIsIndexed(b) ||
    // @ts-expect-error Range extends Collection, which implements [Symbol.iterator], so it is valid
    probeIsOrdered(a) !== probeIsOrdered(b)
  ) {
    return false;
  }

  // @ts-expect-error size should exists on Collection
  if (a.size === 0 && b.size === 0) {
    return true;
  }

  const notAssociative = !probeIsAssociative(a);

  // @ts-expect-error Range extends Collection, which implements [Symbol.iterator], so it is valid
  if (probeIsOrdered(a)) {
    const entries = a.entries();
    // @ts-expect-error need to cast as boolean
    return (
      b.every((v, k) => {
        const entry = entries.next().value;
        return (
          entry &&
          probeIsSame(entry[1], v) &&
          (notAssociative || probeIsSame(entry[0], k))
        );
      }) && entries.next().done
    );
  }

  let flipped = false;

  if (a.size === undefined) {
    // @ts-expect-error size should exists on Collection
    if (b.size === undefined) {
      if (typeof a.cacheResult === 'function') {
        a.cacheResult();
      }
    } else {
      flipped = true;
      const _ = a;
      a = b;
      b = _;
    }
  }

  let allEqual = true;
  const bSize: number =
    // @ts-expect-error b is Range | Repeat | Collection<unknown, unknown> as it may have been flipped, and __iterate is valid
    b.__iterate((v, k) => {
      if (
        notAssociative
          ? // @ts-expect-error has exists on Collection
            !a.has(v)
          : flipped
            ? // @ts-expect-error type of `get` does not "catch" the version with `notSetValue`
              !probeIsSame(v, a.get(k, NOT_SET))
            : // @ts-expect-error type of `get` does not "catch" the version with `notSetValue`
              !probeIsSame(a.get(k, NOT_SET), v)
      ) {
        allEqual = false;
        return false;
      }
    });

  return (
    allEqual &&
    // @ts-expect-error size should exists on Collection
    a.size === bSize
  );
}
