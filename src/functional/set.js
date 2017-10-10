/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isCollection, isRecord } from '../Predicates';
import shallowCopy from '../utils/shallowCopy';

export function set(collection, key, value) {
  if (isCollection(collection) || isRecord(collection)) {
    // TODO: Set needs set!
    return collection.set(key, value);
  }
  const collectionCopy = shallowCopy(collection);
  collectionCopy[key] = value;
  return collectionCopy;
}
