/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Iterable } from '../Iterable'
import { getIterator } from '../Iterator'
import isArrayLike from './isArrayLike'

export default function forceIterator(keyPath) {
  var iter = getIterator(keyPath);
  if (!iter) {
    // Array might not be iterable in this environment, so we need a fallback
    // to our wrapped type.
    if (!isArrayLike(keyPath)) {
      throw new TypeError('Expected iterable or array-like: ' + keyPath);
    }
    iter = getIterator(Iterable(keyPath));
  }
  return iter;
}
