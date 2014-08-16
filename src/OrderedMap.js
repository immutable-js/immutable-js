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
    if (sequence && sequence.constructor === OrderedMap) {
      return sequence;
    }
    if (!sequence || sequence.length === 0) {
      return OrderedMap.empty();
    }
    return OrderedMap.empty().merge(sequence);
  }

  static empty() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap());
  }

  toString() {
    return this.__toString('OrderedMap {', '}');
  }

  // @pragma Access

  get(k, undefinedValue) {
    if (k != null && this._map) {
      var index = this._map.get(k);
      if (index != null) {
        return this._vector.get(index)[1];
      }
    }
    return undefinedValue;
  }

  // @pragma Modification

  clear() {
    if (this.__ownerID) {
      this.length = 0;
      this._map = this._vector = null;
      return this;
    }
    return OrderedMap.empty();
  }

  set(k, v) {
    if (k == null) {
      return this;
    }
    var newMap = this._map;
    var newVector = this._vector;
    if (newMap) {
      var index = newMap.get(k);
      if (index == null) {
        newMap = newMap.set(k, newVector.length);
        newVector = newVector.push([k, v]);
      } else if (newVector.get(index)[1] !== v) {
        newVector = newVector.set(index, [k, v]);
      }
    } else {
      newVector = Vector.empty().__ensureOwner(this.__ownerID).set(0, [k, v]);
      newMap = Map.empty().__ensureOwner(this.__ownerID).set(k, 0);
    }
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return newVector === this._vector ? this : makeOrderedMap(newMap, newVector);
  }

  delete(k) {
    if (k == null || this._map == null) {
      return this;
    }
    var index = this._map.get(k);
    if (index == null) {
      return this;
    }
    var newMap = this._map.delete(k);
    var newVector = this._vector.delete(index);

    if (newMap.length === 0) {
      return this.clear();
    }
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return newMap === this._map ? this : makeOrderedMap(newMap, newVector);
  }

  __iterate(fn, reverse) {
    return this._vector ? this._vector.fromEntries().__iterate(fn, reverse) : 0;
  }

  __deepEqual(other) {
    var iterator = this._vector.__iterator__();
    return other.every((v, k) => {
      var entry = iterator.next();
      entry && (entry = entry[1]);
      return entry && is(k, entry[0]) && is(v, entry[1]);
    });
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    var newVector = this._vector && this._vector.__ensureOwner(ownerID);
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
