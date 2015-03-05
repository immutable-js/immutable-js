/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { KeyedIterable, IS_ORDERED_SENTINEL, isOrdered } from './Iterable'
import { Map, isMap } from './Map'
import { List } from './List'
import { DELETE, NOT_SET, SIZE } from './TrieUtils'
import assertNotInfinite from './utils/assertNotInfinite'
import { createFactory } from './createFactory'

export class OrderedMapClass extends Map {

  // @pragma Construction

  constructor(map, list, ownerID, hash) {
    this.size = map ? map.size : 0;
    this._map = map;
    this._list = list;
    this.__ownerID = ownerID;
    this.__hash = hash;
  }

  static of(/*...values*/) {
    return this.__factoryDispatch(arguments);
  }

  toString() {
    return this.__toString('OrderedMap {', '}');
  }

  // @pragma Access

  get(k, notSetValue) {
    var index = this._map.get(k);
    return index !== undefined ? this._list.get(index)[1] : notSetValue;
  }

  // @pragma Modification

  clear() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._map.clear();
      this._list.clear();
      return this;
    }
    return this.__empty();
  }

  set(k, v) {
    return updateOrderedMap(this, k, v);
  }

  remove(k) {
    return updateOrderedMap(this, k, NOT_SET);
  }

  wasAltered() {
    return this._map.wasAltered() || this._list.wasAltered();
  }

  __iterate(fn, reverse) {
    return this._list.__iterate(
      entry => entry && fn(entry[1], entry[0], this),
      reverse
    );
  }

  __iterator(type, reverse) {
    return this._list.fromEntrySeq().__iterator(type, reverse);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    var newList = this._list.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      this._list = newList;
      return this;
    }
    return new this.constructor.__Class(newMap, newList, ownerID, this.__hash);
  }

  __empty() {
    return new this.constructor.__Class(Map(), List());
  }

  static __factory(value, emptyOrderedMap) {
    return emptyOrderedMap.withMutations(map => {
      var iter = KeyedIterable(value);
      assertNotInfinite(iter.size);
      iter.forEach((v, k) => map.set(k, v));
    });
  }

}

function isOrderedMap(maybeOrderedMap) {
  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
}

OrderedMapClass.__check = OrderedMapClass.isOrderedMap = isOrderedMap;

OrderedMapClass.prototype[IS_ORDERED_SENTINEL] = true;
OrderedMapClass.prototype[DELETE] = OrderedMapClass.prototype.remove;

export var OrderedMap = createFactory(function Immutable_OrderedMap(map, list, ownerID, hash) {
  OrderedMapClass.call(this, map, list, ownerID, hash)
}, OrderedMapClass)

function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var list = omap._list;
  var i = map.get(k);
  var has = i !== undefined;
  var newMap;
  var newList;
  if (v === NOT_SET) { // removed
    if (!has) {
      return omap;
    }
    if (list.size >= SIZE && list.size >= map.size * 2) {
      newList = list.filter((entry, idx) => entry !== undefined && i !== idx);
      newMap = newList.toKeyedSeq().map(entry => entry[0]).flip().toMap();
      if (omap.__ownerID) {
        newMap.__ownerID = newList.__ownerID = omap.__ownerID;
      }
    } else {
      newMap = map.remove(k);
      newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
    }
  } else {
    if (has) {
      if (v === list.get(i)[1]) {
        return omap;
      }
      newMap = map;
      newList = list.set(i, [k, v]);
    } else {
      newMap = map.set(k, list.size);
      newList = list.set(list.size, [k, v]);
    }
  }
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._list = newList;
    omap.__hash = undefined;
    return omap;
  }
  return new omap.constructor.__Class(newMap, newList);
}
