/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import hasOwnProperty from '../utils/hasOwnProperty';
import isPlainUpdatable from '../utils/isPlainUpdatable';
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
  if (typeof collection.mergeWith === 'function') {
    return collection.mergeWith.apply(collection, [merger, ...sources]);
  }
  if (typeof collection.concat === 'function') {
    return collection.concat.apply(collection, sources);
  }
  if (!isPlainUpdatable(collection)) {
    throw new TypeError('Cannot merge non-updatable value: ' + collection);
  }
  let merged = collection;
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    for (const key in source) {
      if (hasOwnProperty.call(source, key)) {
        const nextVal =
          merger && hasOwnProperty.call(merged, key)
            ? merger(merged[key], source[key], key)
            : source[key];
        if (!hasOwnProperty.call(merged, key) || nextVal !== merged[key]) {
          // Copy on write
          if (merged === collection) {
            merged = shallowCopy(merged);
          }
          merged[key] = nextVal;
        }
      }
    }
  }
  return merged;
}

function isMergeable(value) {
  return (
    value &&
    (typeof value.mergeWith === 'function' ||
      typeof value.concat === 'function' ||
      isPlainUpdatable(value))
  );
}

function deepMergerWith(merger) {
  function deepMerger(oldVal, newVal, key) {
    if (isMergeable(oldVal) && isMergeable(newVal)) {
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
