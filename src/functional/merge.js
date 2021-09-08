import { isImmutable } from '../predicates/isImmutable';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';
import { IndexedCollection, KeyedCollection } from '../Collection';
import hasOwnProperty from '../utils/hasOwnProperty';
import isDataStructure from '../utils/isDataStructure';
import isPlainObject from '../utils/isPlainObj';
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
    ? value => {
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
    return isDataStructure(oldValue) && isDataStructure(newValue)
      ? areMergeable(oldValue, newValue)
        ? mergeWithSources(oldValue, [newValue], deepMerger)
        : newValue
      : merger
      ? merger(oldValue, newValue, key)
      : newValue;
  }
  return deepMerger;
}

function areMergeable(oldValue, newValue) {
  return !(
    (isIndexed(oldValue) || Array.isArray(oldValue)) &&
    (isKeyed(newValue) || isPlainObject(newValue))
  );
}
