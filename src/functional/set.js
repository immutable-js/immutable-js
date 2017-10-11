/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isCollection, isRecord } from '../Predicates';
import hasOwnProperty from '../utils/hasOwnProperty';
import isPlainUpdatable from '../utils/isPlainUpdatable';
import shallowCopy from '../utils/shallowCopy';

export function set(collection, key, value) {
  if (isCollection(collection) || isRecord(collection)) {
    if (!collection.set) {
      throw new TypeError(
        'Cannot update value without .set() method: ' + collection
      );
    }
    return collection.set(key, value);
  }
  if (!isPlainUpdatable(collection)) {
    throw new TypeError('Cannot update non-updatable value: ' + collection);
  }
  if (hasOwnProperty.call(collection, key) && value === collection[key]) {
    return collection;
  }
  const collectionCopy = shallowCopy(collection);
  collectionCopy[key] = value;
  return collectionCopy;
}
