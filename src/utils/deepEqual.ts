import type { CollectionImpl } from '../Collection';
import type { RangeImpl as Range } from '../Range';
import type { RepeatImpl as Repeat } from '../Repeat';
import { NOT_SET } from '../const';
import { is } from '../is';
import { isAssociative } from '../predicates/isAssociative';
import { isCollection } from '../predicates/isCollection';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';
import { isOrdered } from '../predicates/isOrdered';

export default function deepEqual(
  a: Range | Repeat | CollectionImpl<unknown, unknown>,
  b: unknown
): boolean {
  if (a === b) {
    return true;
  }

  if (
    !isCollection(b) ||
    (a.size !== undefined && b.size !== undefined && a.size !== b.size) ||
    // @ts-expect-error __hash exists on Collection
    (a.__hash !== undefined &&
      // @ts-expect-error __hash exists on Collection
      b.__hash !== undefined &&
      // @ts-expect-error __hash exists on Collection
      a.__hash !== b.__hash) ||
    isKeyed(a) !== isKeyed(b) ||
    isIndexed(a) !== isIndexed(b) ||
    isOrdered(a) !== isOrdered(b)
  ) {
    return false;
  }

  if (a.size === 0 && b.size === 0) {
    return true;
  }

  const notAssociative = !isAssociative(a);

  if (isOrdered(a)) {
    const entries = a.entries();
    return !!(
      b.every((v, k) => {
        const entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done
    );
  }

  let flipped = false;

  if (a.size === undefined) {
    if (b.size === undefined) {
      // @ts-expect-error cacheResult might be implemented on some collections
      if (typeof a.cacheResult === 'function') {
        // @ts-expect-error cacheResult might be implemented on some collections
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
              !is(v, a.get(k, NOT_SET))
            : // @ts-expect-error type of `get` does not "catch" the version with `notSetValue`
              !is(a.get(k, NOT_SET), v)
      ) {
        allEqual = false;
        return false;
      }
    });

  return allEqual && a.size === bSize;
}
