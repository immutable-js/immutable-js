/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { is } from '../is'
import { NOT_SET } from '../TrieUtils'
import { isIterable, isKeyed, isIndexed, isAssociative, isOrdered } from '../Iterable'

export default function deepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (
    !isIterable(b) ||
    a.size !== undefined && b.size !== undefined && a.size !== b.size ||
    a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash ||
    isKeyed(a) !== isKeyed(b) ||
    isIndexed(a) !== isIndexed(b) ||
    isOrdered(a) !== isOrdered(b)
  ) {
    return false;
  }

  if (a.size === 0 && b.size === 0) {
    return true;
  }

  var notAssociative = !isAssociative(a);

  if (isOrdered(a)) {
    var entries = a.entries();
    return b.every((v, k) => {
      var entry = entries.next().value;
      return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
    }) && entries.next().done;
  }

  var flipped = false;

  if (a.size === undefined) {
    if (b.size === undefined) {
      a.cacheResult();
    } else {
      flipped = true;
      var _ = a;
      a = b;
      b = _;
    }
  }

  var allEqual = true;
  var bSize = b.__iterate((v, k) => {
    if (notAssociative ? !a.has(v) :
        flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
      allEqual = false;
      return false;
    }
  });

  return allEqual && a.size === bSize;
}
