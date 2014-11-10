/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Iterable"
import "Set"
import "OrderedMap"
/* global SetIterable, KeyedIterable, Set, emptyOrderedMap */
/* exported OrderedSet */


class OrderedSet extends Set {

  // @pragma Construction

  constructor(value) {
    return value === null || value === undefined ? emptyOrderedSet() :
      isOrderedSet(value) ? value :
      emptyOrderedSet().union(SetIterable(value));
  }

  static of(/*...values*/) {
    return this(arguments);
  }

  static fromKeys(value) {
    return this(KeyedIterable(value).keySeq());
  }

  toString() {
    return this.__toString('OrderedSet {', '}');
  }
}

function isOrderedSet(maybeOrderedSet) {
  return !!(maybeOrderedSet && maybeOrderedSet[IS_ORDERED_SET_SENTINEL]);
}

OrderedSet.isOrderedSet = isOrderedSet;

var IS_ORDERED_SET_SENTINEL = '@@__IMMUTABLE_ORDERED_SET__@@';

var OrderedSetPrototype = OrderedSet.prototype;
OrderedSetPrototype[IS_ORDERED_SET_SENTINEL] = true;

OrderedSetPrototype.__empty = emptyOrderedSet;
OrderedSetPrototype.__make = makeOrderedSet;

function makeOrderedSet(map, ownerID) {
  var set = Object.create(OrderedSetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_ORDERED_SET;
function emptyOrderedSet() {
  return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
}
