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
/* global SetIterable, KeyedIterable, IS_ORDERED_SENTINEL, MAKE, isOrdered,
          Set, isSet, emptyOrderedMap */
/* exported OrderedSet */


class OrderedSet extends Set {

  // @pragma Construction

  constructor(value) {
    if (!(this instanceof OrderedSet)) return new OrderedSet(value);
    if (value === MAKE) return this;
    return value === null || value === undefined ? emptyOrderedSet(this) :
      isOrderedSet(value) ? (value.constructor === this.constructor ? value : this.merge(value)) :
      emptyOrderedSet(this).withMutations(set => {
        SetIterable(value).forEach(v => set.add(v));
      });
  }

  static of(/*...values*/) {
    return new this(arguments);
  }

  static fromKeys(value) {
    return new this(KeyedIterable(value).keySeq());
  }

  toString() {
    return this.__toString('OrderedSet {', '}');
  }
}

function isOrderedSet(maybeOrderedSet) {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}

OrderedSet.isOrderedSet = isOrderedSet;

var OrderedSetPrototype = OrderedSet.prototype;
OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

OrderedSetPrototype.__empty = emptyOrderedSet;
OrderedSetPrototype.__make = makeOrderedSet;

function makeOrderedSet(Ctor, map, ownerID) {
  var set = new Ctor(MAKE);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_ORDERED_SET;
function emptyOrderedSet(from) {
  var source = from && from.constructor || OrderedSet;
  return source.prototype === OrderedSet.prototype ?
    (EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(source, emptyOrderedMap()))) :
    makeOrderedSet(source, emptyOrderedMap());
}

