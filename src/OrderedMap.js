/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Iterable"
import "Map"
import "List"
import "TrieUtils"
/* global KeyedIterable, Map, emptyMap, emptyList, DELETE, NOT_SET, SIZE */
/* exported OrderedMap */


class OrderedMap extends Map {

  // @pragma Construction

  constructor(value) {
    return value === null || value === undefined ? emptyOrderedMap() :
      isOrderedMap(value) ? value :
      emptyOrderedMap().merge(KeyedIterable(value));
  }

  static of(/*...values*/) {
    return this(arguments);
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
    return emptyOrderedMap();
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
    return makeOrderedMap(newMap, newList, ownerID, this.__hash);
  }
}

function isOrderedMap(maybeOrderedMap) {
  return !!(maybeOrderedMap && maybeOrderedMap[IS_ORDERED_MAP_SENTINEL]);
}

OrderedMap.isOrderedMap = isOrderedMap;

var IS_ORDERED_MAP_SENTINEL = '@@__IMMUTABLE_ORDERED_MAP__@@';

OrderedMap.prototype[IS_ORDERED_MAP_SENTINEL] = true;
OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



function makeOrderedMap(map, list, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.size = map ? map.size : 0;
  omap._map = map;
  omap._list = list;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  return omap;
}

var EMPTY_ORDERED_MAP;
function emptyOrderedMap() {
  return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
}

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
  return makeOrderedMap(newMap, newList);
}
