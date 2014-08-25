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
import "is"
/* global Map, Vector, is */
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
    var index = this._map.get(k);
    var has = index != null;
    var newMap = has ? this._map : this._map.set(k, this._vector.length);
    var newVector = has ? this._vector.set(index, [k, v]) : this._vector.push([k, v]);

    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return newVector === this._vector ? this : makeOrderedMap(newMap, newVector);
  }

  delete(k) {
    var index = this._map.get(k);
    if (index == null) {
      return this;
    }
    var newMap = this._map.delete(k);
    var newVector = this._vector.delete(index);

    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return newMap.length === 0 ? OrderedMap.empty() : makeOrderedMap(newMap, newVector);
  }

  wasAltered() {
    return this._map.wasAltered() || this._vector.wasAltered();
  }

  iterator() {
    return this._vector.iterator();
  }

  __iterate(fn, reverse) {
    return this._vector.fromEntries().__iterate(fn, reverse);
  }

  __deepEqual(other) {
    var iterator = this._vector.iterator();
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
    return makeOrderedMap(newMap, newVector, ownerID);
  }
}

OrderedMap.from = OrderedMap;

function makeOrderedMap(map, vector, ownerID) {
  var omap = Object.create(OrderedMap.prototype);
  omap.length = map ? map.length : 0;
  omap._map = map;
  omap._vector = vector;
  omap.__ownerID = ownerID;
  return omap;
}

var EMPTY_ORDERED_MAP;
