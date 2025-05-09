import {
  Iterator,
  ITERATE_KEYS,
  ITERATE_VALUES,
  ITERATE_ENTRIES,
} from '../Iterator';

import { collectionOpCacheResultThrough } from '../collection/collection';

const factoryFlipOpIterateUncached = (flipcx, collection, fn, reverse) => {
  return collection.__iterate((v, k) => fn(k, v, this) !== false, reverse);
};

const factoryFlipOpIteratorUncached = (cx, type, reverse) => {
  if (type === ITERATE_ENTRIES) {
    const iterator = cx.__iterator(type, reverse);
    return new Iterator(() => {
      const step = iterator.next();
      if (!step.done) {
        const k = step.value[0];
        step.value[0] = step.value[1];
        step.value[1] = k;
      }
      return step;
    });
  }
  return cx.__iterator(
    type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
    reverse
  );
};

const factoryFlip = (collection, xseq) => {
  const flipSequence = xseq;
  flipSequence._iter = collection;
  flipSequence.size = collection.size;

  flipSequence.flip = () => collection;
  flipSequence.reverse = function () {
    const reversedSequence = collection.reverse.apply(this); // super.reverse()
    reversedSequence.flip = () => collection.reverse();
    return reversedSequence;
  };
  flipSequence.has = (key) => collection.includes(key);
  flipSequence.includes = (key) => collection.has(key);
  flipSequence.cacheResult = function () {
    return collectionOpCacheResultThrough(this);
  };
  flipSequence.__iterateUncached = function (fn, reverse) {
    return factoryFlipOpIterateUncached(this, collection, fn, reverse);
  };
  flipSequence.__iteratorUncached = function (type, reverse) {
    return factoryFlipOpIteratorUncached(collection, type, reverse);
  };

  return flipSequence;
};

export { factoryFlip };
