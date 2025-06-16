import { IndexedCollection, KeyedCollection } from '../Collection';
import { Seq } from '../Seq';
import { isImmutable } from '../predicates/isImmutable';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';
import hasOwnProperty from '../utils/hasOwnProperty';
import isDataStructure from '../utils/isDataStructure';
import shallowCopy from '../utils/shallowCopy';

export function merge(collection, ...sources) {
  return mergeWithSources(collection, sources);
}

export function mergeWith(merger, collection, ...sources) {
  return mergeWithSources(collection, sources, merger);
}

export function mergeDeep(collection, ...sources) {
  return mergeDeepWithSources(collection, sources);
}

export function mergeDeepWith(merger, collection, ...sources) {
  return mergeDeepWithSources(collection, sources, merger);
}

export function mergeDeepWithSources(collection, sources, merger) {
  return mergeWithSources(collection, sources, deepMergerWith(merger));
}

export function mergeWithSources(collection, sources, merger) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot merge into non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    return typeof merger === 'function' && collection.mergeWith
      ? collection.mergeWith(merger, ...sources)
      : collection.merge
        ? collection.merge(...sources)
        : collection.concat(...sources);
  }
  const isArray = Array.isArray(collection);
  let merged = collection;
  const Collection = isArray ? IndexedCollection : KeyedCollection;
  const mergeItem = isArray
    ? (value) => {
        // Copy on write
        if (merged === collection) {
          merged = shallowCopy(merged);
        }
        merged.push(value);
      }
    : (value, key) => {
        const hasVal = hasOwnProperty.call(merged, key);
        const nextVal =
          hasVal && merger ? merger(merged[key], value, key) : value;
        if (!hasVal || nextVal !== merged[key]) {
          // Copy on write
          if (merged === collection) {
            merged = shallowCopy(merged);
          }
          merged[key] = nextVal;
        }
      };
  for (let i = 0; i < sources.length; i++) {
    Collection(sources[i]).forEach(mergeItem);
  }
  return merged;
}

function deepMergerWith(merger) {
  function deepMerger(oldValue, newValue, key) {
    return isDataStructure(oldValue) &&
      isDataStructure(newValue) &&
      areMergeable(oldValue, newValue)
      ? mergeWithSources(oldValue, [newValue], deepMerger)
      : merger
        ? merger(oldValue, newValue, key)
        : newValue;
  }
  return deepMerger;
}

/**
 * It's unclear what the desired behavior is for merging two collections that
 * fall into separate categories between keyed, indexed, or set-like, so we only
 * consider them mergeable if they fall into the same category.
 */
function areMergeable(oldDataStructure, newDataStructure) {
  const oldSeq = Seq(oldDataStructure);
  const newSeq = Seq(newDataStructure);
  // This logic assumes that a sequence can only fall into one of the three
  // categories mentioned above (since there's no `isSetLike()` method).
  return (
    isIndexed(oldSeq) === isIndexed(newSeq) &&
    isKeyed(oldSeq) === isKeyed(newSeq)
  );
}
