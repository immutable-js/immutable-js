import { Iterator, iteratorDone } from '../Iterator';
import {
  IS_KEYED_SYMBOL,
  IS_ORDERED_SYMBOL,
  IS_INDEXED_SYMBOL,
  ITERATE_ENTRIES,
  ITERATE_VALUES,
} from '../const';

import { probeIsKeyed } from '../probe';
import transformToMethods from '../transformToMethods';

import { collectionSeqPropertiesCreate } from './collectionSeq';

const collectionConcatOpIterateUncached = (cx, fn, reverse) => {
  if (cx._wrappedIterables.length === 0) {
    return;
  }

  if (reverse) {
    return cx.cacheResult().__iterate(fn, reverse);
  }

  let iterableIndex = 0;
  const useKeys = probeIsKeyed(cx);
  const iteratorType = useKeys ? ITERATE_ENTRIES : ITERATE_VALUES;
  let currentIterator = cx._wrappedIterables[iterableIndex].__iterator(
    iteratorType,
    reverse
  );

  let keepGoing = true;
  let index = 0;
  while (keepGoing) {
    let next = currentIterator.next();
    while (next.done) {
      iterableIndex++;
      if (iterableIndex === cx._wrappedIterables.length) {
        return index;
      }
      currentIterator = cx._wrappedIterables[iterableIndex].__iterator(
        iteratorType,
        reverse
      );
      next = currentIterator.next();
    }
    const fnResult = useKeys
      ? fn(next.value[1], next.value[0], cx)
      : fn(next.value, index, cx);
    keepGoing = fnResult !== false;
    index++;
  }
  return index;
};

const collectionConcatOpIteratorUncached = (cx, type, reverse) => {
  if (cx._wrappedIterables.length === 0) {
    return new Iterator(iteratorDone);
  }

  if (reverse) {
    return cx.cacheResult().__iterator(type, reverse);
  }

  let iterableIndex = 0;
  let currentIterator = cx._wrappedIterables[iterableIndex].__iterator(
    type,
    reverse
  );
  return new Iterator(() => {
    let next = currentIterator.next();
    while (next.done) {
      iterableIndex++;
      if (iterableIndex === cx._wrappedIterables.length) {
        return next;
      }
      currentIterator = cx._wrappedIterables[iterableIndex].__iterator(
        type,
        reverse
      );
      next = currentIterator.next();
    }
    return next;
  });
};

const collectionConcatCreate = ((cache) => (iterables) => {
  const seqconcat = Object.create(
    cache ||
      (cache = Object.assign(
        {},
        collectionSeqPropertiesCreate(),
        transformToMethods({
          __iteratorUncached: collectionConcatOpIteratorUncached,
          __iterateUncached: collectionConcatOpIterateUncached,
        })
      ))
  );

  seqconcat._shape = 'seqconcat';
  seqconcat._wrappedIterables = iterables.flatMap((iterable) => {
    if (iterable._wrappedIterables) {
      return iterable._wrappedIterables;
    }
    return [iterable];
  });
  seqconcat.size = seqconcat._wrappedIterables.reduce((sum, iterable) => {
    if (sum !== undefined) {
      const size = iterable.size;
      if (size !== undefined) {
        return sum + size;
      }
    }
  }, 0);
  seqconcat[IS_KEYED_SYMBOL] = seqconcat._wrappedIterables[0][IS_KEYED_SYMBOL];
  seqconcat[IS_INDEXED_SYMBOL] =
    seqconcat._wrappedIterables[0][IS_INDEXED_SYMBOL];
  seqconcat[IS_ORDERED_SYMBOL] =
    seqconcat._wrappedIterables[0][IS_ORDERED_SYMBOL];

  return seqconcat;
})();

export { collectionConcatCreate };
