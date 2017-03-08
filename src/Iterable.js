/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Seq, KeyedSeq, IndexedSeq, SetSeq } from './Seq'
import { isIterable, isKeyed, isIndexed, isAssociative } from './Predicates'

export class Iterable {
  constructor(value) {
    return isIterable(value) ? value : Seq(value);
  }
}

export class KeyedIterable extends Iterable {
  constructor(value) {
    return isKeyed(value) ? value : KeyedSeq(value);
  }
}

export class IndexedIterable extends Iterable {
  constructor(value) {
    return isIndexed(value) ? value : IndexedSeq(value);
  }
}

export class SetIterable extends Iterable {
  constructor(value) {
    return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
  }
}

Iterable.Keyed = KeyedIterable;
Iterable.Indexed = IndexedIterable;
Iterable.Set = SetIterable;
