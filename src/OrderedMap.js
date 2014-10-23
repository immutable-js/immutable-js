/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Map"
import "Vector"
import "TrieUtils"
/* global Map, Vector, DELETE, NOT_SET */
/* exported OrderedMap */


class OrderedMap extends Map {

  // @pragma Construction

  constructor(seqable) {
    return arguments.length === 0 ?
      OrderedMap.empty() :
      seqable && seqable.constructor === OrderedMap ?
        seqable :
        OrderedMap.empty().merge(seqable);
  }

  static empty() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(Map.empty(), Vector.empty()));
  }

  toString() {
    return this.__toString('OrderedMap {', '}');
  }

  // @pragma Access

  get(k, notSetValue) {
    var index = this._map.get(k);
    return index != null ? this._vector.get(index)[1] : notSetValue;
  }

  // @pragma Modification

  clear() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._map.clear();
      this._vector.clear();
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
    return this._map.wasAltered() || this._vector.wasAltered();
  }

  __iterate(fn, reverse) {
    return this._vector.__iterate(
      entry => entry && fn(entry[1], entry[0], this),
      reverse
    );
  }

  __iterator(type, reverse) {
    return this._vector.fromEntrySeq().__iterator(type, reverse);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    var newVector = this._vector.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return makeOrderedMap(newMap, newVector, ownerID, this.__hash);
  }
}

OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



function makeOrderedMap(map, vector, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.size = map ? map.size : 0;
  omap._map = map;
  omap._vector = vector;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  return omap;
}

function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var vector = omap._vector;
  var i = map.get(k);
  var has = i !== undefined;
  var removed = v === NOT_SET;
  if ((!has && removed) || (has && v === vector.get(i)[1])) {
    return omap;
  }
  if (!has) {
    i = vector.size;
  }
  var newMap = removed ? map.remove(k) : has ? map : map.set(k, i);
  var newVector = removed ? vector.remove(i) : vector.set(i, [k, v]);
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._vector = newVector;
    omap.__hash = undefined;
    return omap;
  }
  return makeOrderedMap(newMap, newVector);
}

var EMPTY_ORDERED_MAP;
