/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Iterable"
import "Collection"
import "Map"
import "TrieUtils"
import "Operations"
/* global SetIterable, KeyedIterable, SetCollection, MapPrototype,
          DELETE, MAKE, makeEmpty, sortFactory, OrderedSet,
          assertNotInfinite */
/* exported Set, isSet */


class Set extends SetCollection {

  // @pragma Construction

  constructor(value) {
    if (!(this instanceof Set)) return new Set(value);
    if (value === MAKE) return this;
    return value === null || value === undefined ? this.__empty() :
      isSet(value) ? (value.constructor === this.constructor ? value : this.merge(value)) :
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
    return this.__toString('Set {', '}');
  }

  // @pragma Access

  has(value) {
    return this._map.has(value);
  }

  // @pragma Modification

  add(value) {
    return updateSet(this, this._map.set(value, true));
  }

  remove(value) {
    return updateSet(this, this._map.remove(value));
  }

  clear() {
    return updateSet(this, this._map.clear());
  }

  // @pragma Composition

  union(...iters) {
    iters = iters.filter(x => x.size !== 0);
    if (iters.length === 0) {
      return this;
    }
    if (this.size === 0 && iters.length === 1) {
      return new this.constructor(iters[0]);
    }
    return this.withMutations(set => {
      for (var ii = 0; ii < iters.length; ii++) {
        SetIterable(iters[ii]).forEach(value => set.add(value));
      }
    });
  }

  intersect(...iters) {
    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(iter => SetIterable(iter));
    var originalSet = this;
    return this.withMutations(set => {
      originalSet.forEach(value => {
        if (!iters.every(iter => iter.contains(value))) {
          set.remove(value);
        }
      });
    });
  }

  subtract(...iters) {
    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(iter => SetIterable(iter));
    var originalSet = this;
    return this.withMutations(set => {
      originalSet.forEach(value => {
        if (iters.some(iter => iter.contains(value))) {
          set.remove(value);
        }
      });
    });
  }

  merge() {
    return this.union.apply(this, arguments);
  }

  mergeWith(merger, ...iters) {
    return this.union.apply(this, iters);
  }

  sort(comparator) {
    // Late binding
    return OrderedSet(sortFactory(this, comparator));
  }

  sortBy(mapper, comparator) {
    // Late binding
    return OrderedSet(sortFactory(this, comparator, mapper));
  }

  wasAltered() {
    return this._map.wasAltered();
  }

  __iterate(fn, reverse) {
    return this._map.__iterate((_, k) => fn(k, k, this), reverse);
  }

  __iterator(type, reverse) {
    return this._map.map((_, k) => k).__iterator(type, reverse);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return this.__make(newMap, ownerID);
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
    return new Map();
  }

}

function isSet(maybeSet) {
  return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
}

Set.isSet = isSet;

var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

var SetPrototype = Set.prototype;
SetPrototype[IS_SET_SENTINEL] = true;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype.mergeDeep = SetPrototype.merge;
SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
SetPrototype.withMutations = MapPrototype.withMutations;
SetPrototype.asMutable = MapPrototype.asMutable;
SetPrototype.asImmutable = MapPrototype.asImmutable;

function updateSet(set, newMap) {
  if (set.__ownerID) {
    set.size = newMap.size;
    set._map = newMap;
    return set;
  }
  return newMap === set._map ? set :
    newMap.size === 0 ? set.__empty(set) :
    set.__make(newMap);
}
