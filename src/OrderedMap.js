/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "Map"
import "Vector"
import "is"
import "TrieUtils"
import "Symbol"
/* global iteratorMapper, Map, Vector, is, NOT_SET, DELETE */
/* exported OrderedMap */


class OrderedMap extends Map {

  // @pragma Construction

  constructor(sequence) {
    var map = OrderedMap.empty();
    return sequence ?
      sequence.constructor === OrderedMap ?
        sequence :
        map.merge(sequence) :
      map;
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
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
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

  keys() {
    return iteratorMapper(this.entries(), entry => entry[0]);
  }

  values() {
    return iteratorMapper(this.entries(), entry => entry[1]);
  }

  entries() {
    return this._vector.values(true);
  }

  __iterate(fn, reverse) {
    return this._vector.fromEntrySeq().__iterate(fn, reverse);
  }

  __deepEqual(other) {
    var iterator = this.entries();
    return other.every((v, k) => {
      var entry = iterator.next().value;
      return entry && is(entry[0], k) && is(entry[1], v);
    });
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

OrderedMap.from = OrderedMap;
OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;

function makeOrderedMap(map, vector, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.length = map ? map.length : 0;
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
    i = vector.length;
  }
  var newMap = removed ? map.remove(k) : has ? map : map.set(k, i);
  var newVector = removed ? vector.remove(i) : vector.set(i, [k, v]);
  if (omap.__ownerID) {
    omap.length = newMap.length;
    omap._map = newMap;
    omap._vector = newVector;
    omap.__hash = undefined;
    return omap;
  }
  return makeOrderedMap(newMap, newVector);
}

var EMPTY_ORDERED_MAP;
