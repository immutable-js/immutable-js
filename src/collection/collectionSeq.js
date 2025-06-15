import {
  Iterator,
  getIterator,
  iteratorValue,
  iteratorDone,
} from '../Iterator';
import { IS_SEQ_SYMBOL } from '../const';
import { probeIsIterator } from '../probe';
import transformToMethods from '../transformToMethods';

import { collectionPropertiesCreate } from './collection';

const collectionSeqOpIterateUncached = (cx, fn, reverse) => {
  if (reverse) {
    return cx.cacheResult().__iterate(fn, reverse);
  }
  const collection = cx._collection;
  const iterator = getIterator(collection);
  let iterations = 0;
  if (probeIsIterator(iterator)) {
    let step;
    while (!(step = iterator.next()).done) {
      if (fn(step.value, iterations++, cx) === false) {
        break;
      }
    }
  }
  return iterations;
};

const collectionSeqOpIteratorUncached = (cx, type, reverse) => {
  if (reverse) {
    return cx.cacheResult().__iterator(type, reverse);
  }
  const collection = cx._collection;
  const iterator = getIterator(collection);
  if (!probeIsIterator(iterator)) {
    return new Iterator(iteratorDone);
  }
  let iterations = 0;
  return new Iterator(() => {
    const step = iterator.next();
    return step.done ? step : iteratorValue(type, iterations++, step.value);
  });
};

const collectionSeqOpIterate = (seq, fn, reverse) => {
  const cache = seq._cache;
  if (cache) {
    const size = cache.length;
    let i = 0;
    while (i !== size) {
      const entry = cache[reverse ? size - ++i : i++];
      if (fn(entry[1], entry[0], seq) === false) {
        break;
      }
    }
    return i;
  }
  return seq.__iterateUncached(fn, reverse);
};

const collectionSeqOpIterator = (seq, type, reverse) => {
  const cache = seq._cache;
  if (cache) {
    const size = cache.length;
    let i = 0;
    return new Iterator(() => {
      if (i === size) {
        return iteratorDone();
      }
      const entry = cache[reverse ? size - ++i : i++];
      return iteratorValue(type, entry[0], entry[1]);
    });
  }
  return seq.__iteratorUncached(type, reverse);
};

const collectionSeqOpCacheResult = (seq) => {
  if (!seq._cache && seq.__iterateUncached) {
    seq._cache = seq.entrySeq().toArray();
    seq.size = seq._cache.length;
  }
  return seq;
};

const collectionSeqPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionPropertiesCreate(),
      transformToMethods({
        [IS_SEQ_SYMBOL]: true,
        toSeq: (cx) => cx,
        cacheResult: collectionSeqOpCacheResult,
        __iterateUncached: collectionSeqOpIterateUncached,
        __iteratorUncached: collectionSeqOpIteratorUncached,
        __iterate: collectionSeqOpIterate,
        __iterator: collectionSeqOpIterator,
      })
    ))
  );
})();

const collectionSeqCreate = () => {
  const seq = Object.create(collectionSeqPropertiesCreate());

  seq._shape = 'seq';

  return seq;
};

export {
  collectionSeqOpCacheResult,
  collectionSeqOpIterate,
  collectionSeqOpIterator,
  collectionSeqOpIterateUncached,
  collectionSeqOpIteratorUncached,
  collectionSeqCreate,
  collectionSeqPropertiesCreate,
};
