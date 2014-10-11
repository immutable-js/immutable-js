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
import "TrieUtils"
import "Iterator"
/* global Sequence, IndexedSequencePrototype, iteratorMapper,
          Map, MapPrototype, DELETE,
          ITERATOR_SYMBOL, ITERATE_KEYS, ITERATE_ENTRIES */
/* exported Set */


class Set extends Sequence {

  // @pragma Construction

  constructor(...values) {
    return Set.from(values);
  }

  static empty() {
    return EMPTY_SET || (EMPTY_SET = makeSet(Map.empty()));
  }

  static from(sequence) {
    var set = Set.empty();
    return sequence ?
      sequence.constructor === Set ?
        sequence :
        set.union(sequence) :
      set;
  }

  static fromKeys(sequence) {
    return Set.from(Sequence(sequence).flip());
  }

  toString() {
    return this.__toString('Set {', '}');
  }

  // @pragma Access

  has(value) {
    return this._map.has(value);
  }

  get(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  }

  // @pragma Modification

  add(value) {
    var newMap = this._map.set(value, null);
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : makeSet(newMap);
  }

  remove(value) {
    var newMap = this._map.remove(value);
    if (this.__ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      return this;
    }
    return newMap === this._map ? this : newMap.length === 0 ? Set.empty() : makeSet(newMap);
  }

  clear() {
    if (this.length === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.length = 0;
      this._map.clear();
      return this;
    }
    return Set.empty();
  }

  // @pragma Composition

  union(/*...seqs*/) {
    var seqs = arguments;
    if (seqs.length === 0) {
      return this;
    }
    return this.withMutations(set => {
      for (var ii = 0; ii < seqs.length; ii++) {
        Sequence(seqs[ii]).forEach(value => set.add(value));
      }
    });
  }

  intersect(...seqs) {
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map(seq => Sequence(seq));
    var originalSet = this;
    return this.withMutations(set => {
      originalSet.forEach(value => {
        if (!seqs.every(seq => seq.contains(value))) {
          set.remove(value);
        }
      });
    });
  }

  subtract(...seqs) {
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map(seq => Sequence(seq));
    var originalSet = this;
    return this.withMutations(set => {
      originalSet.forEach(value => {
        if (seqs.some(seq => seq.contains(value))) {
          set.remove(value);
        }
      });
    });
  }

  isSubset(seq) {
    seq = Sequence(seq);
    return this.every(value => seq.contains(value));
  }

  isSuperset(seq) {
    var set = this;
    seq = Sequence(seq);
    return seq.every(value => set.contains(value));
  }

  wasAltered() {
    return this._map.wasAltered();
  }

  hashCode() {
    return this._map.hashCode();
  }

  __iterator(type, reverse) {
    var iterator = this._map.__iterator(ITERATE_KEYS, reverse);
    return type === ITERATE_ENTRIES ?
      iteratorMapper(iterator, key => [key, key]) :
      iterator;
  }

  __iterate(fn, reverse) {
    var collection = this;
    return this._map.__iterate((_, k) => fn(k, k, collection), reverse);
  }

  __deepEquals(other) {
    return this.isSuperset(other);
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
SetPrototype[ITERATOR_SYMBOL] = SetPrototype.values;
SetPrototype.contains = SetPrototype.has;
SetPrototype.mergeDeep = SetPrototype.merge = SetPrototype.union;
SetPrototype.mergeDeepWith = SetPrototype.mergeWith = function(merger, ...seqs) {
  return this.merge.apply(this, seqs);
};
SetPrototype.withMutations = MapPrototype.withMutations;
SetPrototype.asMutable = MapPrototype.asMutable;
SetPrototype.asImmutable = MapPrototype.asImmutable;
SetPrototype.__toJS = IndexedSequencePrototype.__toJS;
SetPrototype.__toStringMapper = IndexedSequencePrototype.__toStringMapper;


function makeSet(map, ownerID) {
  var set = Object.create(SetPrototype);
  set.length = map ? map.length : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_SET;
