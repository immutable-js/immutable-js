/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { SetIterable, KeyedIterable, IS_ORDERED_SENTINEL, isOrdered } from './Iterable'
import { SetClass, isSet } from './Set'
import { OrderedMap } from './OrderedMap'
import assertNotInfinite from './utils/assertNotInfinite'
import { createFactory } from './createFactory'

export class OrderedSetClass extends SetClass {

  // @pragma Construction

  constructor(map, ownerID) {
    this.size = map ? map.size : 0;
    this._map = map;
    this.__ownerID = ownerID;
  }

  static of(/*...values*/) {
    return this.__factoryDispatch(arguments);
  }

  static fromKeys(value) {
    return this.__factoryDispatch(KeyedIterable(value).keySeq());
  }

  toString() {
    return this.__toString('OrderedSet {', '}');
  }

  __empty() {
    return this.__make(OrderedMap())
  }

  __make(map, ownerID) {
    return new this.constructor.__Class(map, ownerID);
  }

  static __factory(value, emptyOrderedSet) {
    return emptyOrderedSet.withMutations(set => {
      var iter = SetIterable(value);
      assertNotInfinite(iter.size);
      iter.forEach(v => set.add(v));
    });
  }

}

function isOrderedSet(maybeOrderedSet) {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}

OrderedSetClass.__check = OrderedSetClass.isOrderedSet = isOrderedSet;

var OrderedSetPrototype = OrderedSetClass.prototype;
OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

export var OrderedSet = createFactory(function Immutable_OrderedSet(map, ownerID) {
  OrderedSetClass.call(this, map, ownerID)
}, OrderedSetClass)
