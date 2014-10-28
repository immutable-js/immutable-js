/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Map"
import "List"
import "TrieUtils"
/* global Map, List, DELETE, NOT_SET */
/* exported OrderedMap */


class OrderedMap extends Map {

  // @pragma Construction

  constructor(value) {
    return arguments.length === 0 ? OrderedMap.empty() :
      value && value.constructor === OrderedMap ? value :
      OrderedMap.empty().merge(value);
  }

  static empty() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(Map.empty(), List.empty()));
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
    return OrderedMap.empty();
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
      entry => fn(entry[1], entry[0], this),
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

function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var list = omap._list;
  var i = map.get(k);
  var has = i !== undefined;
  var removed = v === NOT_SET;
  if ((!has && removed) || (has && v === list.get(i)[1])) {
    return omap;
  }
  if (!has) {
    i = list.size;
  }
  var newMap = removed ? map.remove(k) : has ? map : map.set(k, i);
  var newList = removed ? list.remove(i) : list.set(i, [k, v]);
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._list = newList;
    omap.__hash = undefined;
    return omap;
  }
  return makeOrderedMap(newMap, newList);
}

var EMPTY_ORDERED_MAP;
