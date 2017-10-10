/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import shallowCopy from '../utils/shallowCopy';
import hasOwnProperty from '../utils/hasOwnProperty';
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
  // TODO: Set needs concat!
  if (typeof collection.concat === 'function') {
    return collection.concat.apply(collection, sources);
  }
  const collectionCopy = shallowCopy(collection);
  // TODO: can clean up with KeyedSeq?
  for (let i = 0; i < sources.length; i++) {
    const nextSource = sources[i];
    if (nextSource != null) {
      for (const key in nextSource) {
        if (hasOwnProperty.call(nextSource, key)) {
          collectionCopy[key] =
            merger && hasOwnProperty.call(collectionCopy, key)
              ? merger(collectionCopy[key], nextSource[key], key)
              : nextSource[key];
        }
      }
    }
  }
  return collectionCopy;
}

function deepMergerWith(merger) {
  function deepMerger(oldVal, newVal, key) {
    if (oldVal && newVal && typeof newVal === 'object') {
      return mergeWithSources(deepMerger, oldVal, newVal);
    }
    const nextValue = merger(oldVal, newVal, key);
    return is(oldVal, nextValue) ? oldVal : nextValue;
  }
  return deepMerger;
}

function alwaysNewVal(oldVal, newVal) {
  return newVal;
}
