import { Iterator, iteratorValue } from '../Iterator';

import { IS_ORDERED_SYMBOL, ITERATE_VALUES } from '../const';

import { probeIsCollection } from '../probe';
import transformToMethods from '../transformToMethods';

import { collectionKeyedSeqPropertiesCreate } from './collectionKeyedSeq';

const collectionKeyedSeqFromEntriesOpEntrySeq = (cx) => {
  return cx._iter.toSeq();
};

const validateEntry = (entry) => {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
};

const collectionKeyedSeqFromEntriesOpIterate = (cx, fn, reverse) => {
  return cx._iter.__iterate((entry) => {
    // Check if entry exists first so array access doesn't throw for holes
    // in the parent iteration.
    if (entry) {
      validateEntry(entry);
      const indexedCollection = probeIsCollection(entry);
      return fn(
        indexedCollection ? entry.get(1) : entry[1],
        indexedCollection ? entry.get(0) : entry[0],
        cx
      );
    }
  }, reverse);
};

const collectionKeyedSeqFromEntriesOpIterator = (cx, type, reverse) => {
  const iterator = cx._iter.__iterator(ITERATE_VALUES, reverse);
  return new Iterator(() => {
    while (true) {
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      // Check if entry exists first so array access doesn't throw for holes
      // in the parent iteration.
      if (entry) {
        validateEntry(entry);
        const indexedCollection = probeIsCollection(entry);
        return iteratorValue(
          type,
          indexedCollection ? entry.get(0) : entry[0],
          indexedCollection ? entry.get(1) : entry[1],
          step
        );
      }
    }
  });
};

const collectionKeyedSeqFromEntriesCreate = ((cache) => (entries) => {
  const setseqkeyxfromentries = Object.create(
    cache ||
      (cache = Object.assign(
        {},
        collectionKeyedSeqPropertiesCreate(),
        transformToMethods({
          [IS_ORDERED_SYMBOL]: true,
          entrySeq: collectionKeyedSeqFromEntriesOpEntrySeq,
          __iterate: collectionKeyedSeqFromEntriesOpIterate,
          __iterator: collectionKeyedSeqFromEntriesOpIterator,
        })
      ))
  );

  setseqkeyxfromentries._iter = entries;
  setseqkeyxfromentries.size = entries.size;

  return setseqkeyxfromentries;
})();

export {
  collectionKeyedSeqFromEntriesOpEntrySeq,
  collectionKeyedSeqFromEntriesOpIterate,
  collectionKeyedSeqFromEntriesCreate,
};
