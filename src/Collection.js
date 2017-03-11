/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Seq, KeyedSeq, IndexedSeq, SetSeq } from './Seq';
import { isCollection, isKeyed, isIndexed, isAssociative } from './Predicates';

export class Collection {
  constructor(value) {
    return isCollection(value) ? value : Seq(value);
  }
}

export class KeyedCollection extends Collection {
  constructor(value) {
    return isKeyed(value) ? value : KeyedSeq(value);
  }
}

export class IndexedCollection extends Collection {
  constructor(value) {
    return isIndexed(value) ? value : IndexedSeq(value);
  }
}

export class SetCollection extends Collection {
  constructor(value) {
    return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
  }
}

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
