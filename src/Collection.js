/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
