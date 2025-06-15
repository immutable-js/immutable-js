
import { Iterator, iteratorValue, ITERATE_ENTRIES } from '../Iterator';

import { ensureSize } from '../TrieUtils';
import { collectionOpCacheResultThrough } from '../collection/collection';

import { factoryFlip } from './factoryFlip';

const factoryReverse = (collection, makeSequence, useKeys) => {
  const reversedSequence = makeSequence(collection);
  reversedSequence._iter = collection;
  reversedSequence.size = collection.size;
  reversedSequence.reverse = () => collection;
  if (collection.flip) {
    reversedSequence.flip = function () {
      const flipSequence = factoryFlip(collection);
      flipSequence.reverse = () => collection.flip();
      return flipSequence;
    };
  }
  reversedSequence.get = (key, notSetValue) =>
    collection.get(useKeys ? key : -1 - key, notSetValue);
  reversedSequence.has = (key) => collection.has(useKeys ? key : -1 - key);
  reversedSequence.includes = (value) => collection.includes(value);
  reversedSequence.cacheResult = function () {
    return collectionOpCacheResultThrough(this);
  };
  reversedSequence.__iterate = function (fn, reverse) {
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(collection);
    return collection.__iterate(
      (v, k) => fn(v, useKeys ? k : reverse ? this.size - ++i : i++, this),
      !reverse
    );
  };
  reversedSequence.__iterator = (type, reverse) => {
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(collection);
    const iterator = collection.__iterator(ITERATE_ENTRIES, !reverse);
    return new Iterator(() => {
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      return iteratorValue(
        type,
        useKeys ? entry[0] : reverse ? this.size - ++i : i++,
        entry[1],
        step
      );
    });
  };
  return reversedSequence;
};

export { factoryReverse };
