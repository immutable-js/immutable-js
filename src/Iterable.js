/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Seq, KeyedSeq, IndexedSeq, SetSeq } from './Seq'

export { Iterable, KeyedIterable, IndexedIterable, SetIterable,
          isIterable, isKeyed, isIndexed, isAssociative, isOrdered,
          IS_ITERABLE_SENTINEL, IS_KEYED_SENTINEL, IS_INDEXED_SENTINEL, IS_ORDERED_SENTINEL }


class Iterable {
  constructor(value) {
    return isIterable(value) ? value : Seq(value);
  }
}

class KeyedIterable extends Iterable {
  constructor(value) {
    return isKeyed(value) ? value : KeyedSeq(value);
  }
}

class IndexedIterable extends Iterable {
  constructor(value) {
    return isIndexed(value) ? value : IndexedSeq(value);
  }
}

class SetIterable extends Iterable {
  constructor(value) {
    return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
  }
}


function isIterable(maybeIterable) {
  return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
}

function isKeyed(maybeKeyed) {
  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
}

function isIndexed(maybeIndexed) {
  return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
}

function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}

function isOrdered(maybeOrdered) {
  return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
}

Iterable.isIterable = isIterable;
Iterable.isKeyed = isKeyed;
Iterable.isIndexed = isIndexed;
Iterable.isAssociative = isAssociative;
Iterable.isOrdered = isOrdered;
Iterable.Keyed = KeyedIterable;
Iterable.Indexed = IndexedIterable;
Iterable.Set = SetIterable;


var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';
