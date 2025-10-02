import { KeyedCollection } from '../Collection';
import { NOT_SET } from '../TrieUtils';
import { update } from '../functional/update';
import { isRecord } from '../predicates/isRecord';

export function merge(...iters) {
  return mergeIntoKeyedWith(this, iters);
}

export function mergeWith(merger, ...iters) {
  if (typeof merger !== 'function') {
    throw new TypeError('Invalid merger function: ' + merger);
  }
  return mergeIntoKeyedWith(this, iters, merger);
}

function mergeIntoKeyedWith(collection, collections, merger) {
  const iters = [];
  for (let ii = 0; ii < collections.length; ii++) {
    const collection = KeyedCollection(collections[ii]);
    if (collection.size !== 0) {
      iters.push(collection);
    }
  }
  if (iters.length === 0) {
    return collection;
  }
  if (
    collection.toSeq().size === 0 &&
    !collection.__ownerID &&
    iters.length === 1
  ) {
    return isRecord(collection)
      ? collection // Record is empty and will not be updated: return the same instance
      : collection.create(iters[0]);
  }
  return collection.withMutations((collection) => {
    const mergeIntoCollection = merger
      ? (value, key) => {
          update(collection, key, NOT_SET, (oldVal) =>
            oldVal === NOT_SET ? value : merger(oldVal, value, key)
          );
        }
      : (value, key) => {
          collection.set(key, value);
        };
    for (let ii = 0; ii < iters.length; ii++) {
      iters[ii].forEach(mergeIntoCollection);
    }
  });
}
