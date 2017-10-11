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

export function remove(collection, key) {
  if (isCollection(collection) || isRecord(collection)) {
    return collection.delete(key);
  }
  if (!isPlainUpdatable(collection)) {
    throw new TypeError('Cannot update non-updatable value: ' + collection);
  }
  if (!hasOwnProperty.call(collection, key)) {
    return collection;
  }
  const collectionCopy = shallowCopy(collection);
  if (Array.isArray(collectionCopy)) {
    collectionCopy.splice(key, 1);
  } else {
    delete collectionCopy[key];
  }
  return collectionCopy;
}
