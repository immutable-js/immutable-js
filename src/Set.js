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
import "Seq"
import "Map"
import "TrieUtils"
/* global Iterable, SetCollection, KeyedSeq, MapPrototype, emptyMap, DELETE */
/* exported Set */


class Set extends SetCollection {

  // @pragma Construction

  constructor(value) {
    return arguments.length === 0 ? emptySet() :
      value && value.constructor === Set ? value :
      emptySet().union(value);
  }

  static of(/*...values*/) {
    return this(arguments);
  }

  static fromKeys(value) {
    return this(KeyedSeq(value).flip());
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
    var newMap = this._map.set(value, true);
    if (this.__ownerID) {
      this.size = newMap.size;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : makeSet(newMap);
  }

  remove(value) {
    var newMap = this._map.remove(value);
    if (this.__ownerID) {
      this.size = newMap.size;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : newMap.size === 0 ? emptySet() : makeSet(newMap);
  }

  clear() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._map.clear();
      return this;
    }
    return emptySet();
  }

  // @pragma Composition

  union(/*...iters*/) {
    var iters = arguments;
    if (iters.length === 0) {
      return this;
    }
    return this.withMutations(set => {
      for (var ii = 0; ii < iters.length; ii++) {
        Iterable(iters[ii]).forEach(value => set.add(value));
      }
    });
  }

  intersect(...iters) {
    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(iter => Iterable(iter));
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
    iters = iters.map(iter => Iterable(iter));
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
    return makeSet(newMap, ownerID);
  }
}

var SetPrototype = Set.prototype;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype.mergeDeep = SetPrototype.merge;
SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
SetPrototype.withMutations = MapPrototype.withMutations;
SetPrototype.asMutable = MapPrototype.asMutable;
SetPrototype.asImmutable = MapPrototype.asImmutable;


function makeSet(map, ownerID) {
  var set = Object.create(SetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_SET;
function emptySet() {
  return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
}
