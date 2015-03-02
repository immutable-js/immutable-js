/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { SetIterable, KeyedIterable } from './Iterable'
import { SetCollection } from './Collection'
import { Map, MapPrototype } from './Map'
import { DELETE } from './TrieUtils'
import { sortFactory } from './Operations'
import assertNotInfinite from './utils/assertNotInfinite'
import { createFactory } from './createFactory'

import { OrderedSet } from './OrderedSet'

export class SetClass extends SetCollection {

  // @pragma Construction

  constructor(map, ownerID) {
    this.size = map ? map.size : 0;
    this._map = map;
    this.__ownerID = ownerID;
  }

  static of(/*...values*/) {
    return this.factory(arguments);
  }

  static fromKeys(value) {
    return this.factory(KeyedIterable(value).keySeq());
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
      return this.constructor.factory(iters[0]);
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
    return new this.constructor(newMap, ownerID);
  }

  __empty() {
    return EMPTY_SET;
  }

  static __factory(value, emptySet) {
    return emptySet.withMutations(set => {
      var iter = SetIterable(value);
      assertNotInfinite(iter.size);
      iter.forEach(v => set.add(v));
    });
  }

}

export function isSet(maybeSet) {
  return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
}

SetClass.__check = SetClass.isSet = isSet;

var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

var SetPrototype = SetClass.prototype;
SetPrototype[IS_SET_SENTINEL] = true;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype.mergeDeep = SetPrototype.merge;
SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
SetPrototype.withMutations = MapPrototype.withMutations;
SetPrototype.asMutable = MapPrototype.asMutable;
SetPrototype.asImmutable = MapPrototype.asImmutable;

var EMPTY_SET = new SetClass(Map())

/*jshint -W079 */
export var Set = createFactory(SetClass)

function updateSet(set, newMap) {
  if (set.__ownerID) {
    set.size = newMap.size;
    set._map = newMap;
    return set;
  }
  return newMap === set._map ? set :
    newMap.size === 0 ? set.__empty() :
    new set.constructor(newMap);
}
