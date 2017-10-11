/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isMap } from '../Map';
import { isCollection, isRecord } from '../Predicates';
import { IndexedCollection, KeyedCollection } from '../Collection';
import hasOwnProperty from '../utils/hasOwnProperty';
import isUpdatable from '../utils/isUpdatable';
import shallowCopy from '../utils/shallowCopy';
import { is } from '../is';

export function merge(collection, ...sources) {
  return mergeWithSources(undefined, collection, sources);
}

export function mergeWith(merger, collection, ...sources) {
  return mergeWithSources(merger, collection, sources);
}

export function mergeDeep(collection, ...sources) {
  return mergeWithSources(deepMergerWith(alwaysNewVal), collection, sources);
}

export function mergeDeepWith(merger, collection, ...sources) {
  return mergeWithSources(deepMergerWith(merger), collection, sources);
}

function mergeWithSources(merger, collection, sources) {
  if (!isUpdatable(collection)) {
    throw new TypeError('Cannot merge non-updatable value: ' + collection);
  }
  if (isMap(collection) || isRecord(collection)) {
    return collection.mergeWith(merger, ...sources);
  }
  if (isCollection(collection)) {
    return collection.concat(...sources);
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
        const nextVal =
          merger && hasOwnProperty.call(merged, key)
            ? merger(merged[key], value, key)
            : value;
        if (!hasOwnProperty.call(merged, key) || nextVal !== merged[key]) {
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
  function deepMerger(oldVal, newVal, key) {
    if (isUpdatable(oldVal) && isUpdatable(newVal)) {
      return mergeWithSources(deepMerger, oldVal, [newVal]);
    }
    const nextValue = merger(oldVal, newVal, key);
    return is(oldVal, nextValue) ? oldVal : nextValue;
  }
  return deepMerger;
}

function alwaysNewVal(oldVal, newVal) {
  return newVal;
}
