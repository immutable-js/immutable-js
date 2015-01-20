/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {MAKE, makeEmpty} from './TrieUtils'
import { SetIterable, KeyedIterable, IS_ORDERED_SENTINEL, isOrdered } from './Iterable'
import { Set, isSet } from './Set'
import { OrderedMap } from './OrderedMap'
import assertNotInfinite from './utils/assertNotInfinite'

export class OrderedSet extends Set {

  // @pragma Construction

  constructor(value) {
    if (!(this instanceof OrderedSet)) return new OrderedSet(value);
    if (value === MAKE) return this;
    return value === null || value === undefined ? this.__empty() :
      isOrderedSet(value) ? (value.constructor === this.constructor ? value : this.merge(value)) :
      this.__empty().withMutations(set => {
        var iter = SetIterable(value);
        assertNotInfinite(iter.size);
        iter.forEach(v => set.add(v));
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

  __make(map, ownerID) {
    var set = new this.constructor(MAKE);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  __empty() {
    return makeEmpty(this, this.__emptyMap());
  }

  __emptyMap() {
    return new OrderedMap();
  }

}

function isOrderedSet(maybeOrderedSet) {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}

OrderedSet.isOrderedSet = isOrderedSet;

var OrderedSetPrototype = OrderedSet.prototype;
OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

