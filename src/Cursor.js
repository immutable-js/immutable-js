/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "is"
import "Sequence"
import "Map"
import "Vector"
import "Set"
import "TrieUtils"
import "Iterator"
/* global is, Sequence, Map, Vector, Set, NOT_SET, DELETE,
          ITERATE_ENTRIES, Iterator, iteratorDone, iteratorValue */
/* exported makeCursor */

class MapCursor extends Map {

  constructor(rootData, keyPath, onChange, length) {
    this.length = length;
    this._rootData = rootData;
    this._keyPath = keyPath;
    this._onChange = onChange;
  }

  toString() {
    return (this.deref() || Map.empty()).toString();
  }

  equals(second) {
    return is(
      this.deref(),
      second && (typeof second.deref === 'function' ? second.deref() : second)
    );
  }

  deref(notSetValue) {
    return this._rootData.getIn(this._keyPath, notSetValue);
  }

  get(key, notSetValue) {
    return this.getIn([key], notSetValue);
  }

  getIn(searchKeyPath, notSetValue) {
    if (!searchKeyPath || (Array.isArray(searchKeyPath) && searchKeyPath.length === 0)) {
      return this;
    }
    var value = this._rootData.getIn(this._keyPath.concat(searchKeyPath), NOT_SET);
    return value === NOT_SET ? notSetValue : wrappedValue(this, searchKeyPath, value);
  }

  set(key, value) {
    return updateCursor(this, m => m.set(key, value), key);
  }

  remove(key) {
    return updateCursor(this, m => m.remove(key), key);
  }

  // update intentionally provided by Map

  updateIn(keyPath, notSetValue, updater) {
    return updateCursor(this, m => m.updateIn(keyPath, notSetValue, updater), keyPath);
  }

  merge(/*...seqs*/) {
    var args = arguments;
    return updateCursor(this, m => m.merge.apply(m, args));
  }

  mergeWith(/*merger, ...seqs*/) {
    var args = arguments;
    return updateCursor(this, m => m.mergeWith.apply(m, args));
  }

  mergeDeep(/*...seqs*/) {
    var args = arguments;
    return updateCursor(this, m => m.mergeDeep.apply(m, args));
  }

  mergeDeepWith(/*merger, ...seqs*/) {
    var args = arguments;
    return updateCursor(this, m => m.mergeDeepWith.apply(m, args));
  }

  clear() {
    return updateCursor(this, m => m.clear());
  }

  cursor(maybeKeyPath, onChange) {
    var keyPath =
      arguments.length === 0 ||
      typeof maybeKeyPath === 'function' && (onChange = maybeKeyPath) ? [] :
      Array.isArray(maybeKeyPath) ? maybeKeyPath : [maybeKeyPath];
    if (!onChange) {
      if (keyPath.length === 0) {
        return this;
      }
      return subCursor(this, keyPath);
    }
    return makeCursor(this, keyPath, onChange);
  }

  withMutations(fn) {
    return updateCursor(this, m => m.withMutations(fn));
  }

  asMutable() {
    return updateCursor(this, m => m.asMutable());
  }

  asImmutable() {
    return updateCursor(this, m => m.asImmutable());
  }

  wasAltered() {
    var deref = this.deref();
    return !!(deref && deref.__altered);
  }

  __iterate(fn, reverse) {
    var deref = this.deref();
    return deref && deref.__iterate ? deref.__iterate(
      (v, k) => fn(wrappedValue(this, k, v), k, this),
      reverse
    ) : 0;
  }

  __iterator(type, reverse) {
    var deref = this.deref();
    var iterator = deref && deref.__iterator && deref.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator(() => {
      if (!iterator) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      return iteratorValue(type, k, wrappedValue(this, k, v), step);
    });
  }

  __ensureOwner(ownerID) {
    return updateCursor(this, m => m.__ensureOwner(ownerID));
  }
}

var MapCursorPrototype = MapCursor.prototype;
MapCursorPrototype[DELETE] = MapCursorPrototype.remove;



class VectorCursor extends Vector {

  constructor(rootData, keyPath, onChange, length) {
    this.length = length;
    this._rootData = rootData;
    this._keyPath = keyPath;
    this._onChange = onChange;
  }

  push(/*...values*/) {
    var args = arguments;
    return updateCursor(this, v => v.push.apply(v, args));
  }

  pop() {
    return updateCursor(this, v => v.pop());
  }

  unshift(/*...values*/) {
    var args = arguments;
    return updateCursor(this, v => v.unshift.apply(v, args));
  }

  shift() {
    return updateCursor(this, v => v.shift());
  }

  setLength(length) {
    return updateCursor(this, v => v.setLength(length));
  }

  slice(begin, end) {
    var args = arguments;
    return updateCursor(this, v => v.slice.apply(v, args));
  }
}

var VectorCursorPrototype = VectorCursor.prototype;
VectorCursorPrototype[DELETE] = VectorCursorPrototype.remove = MapCursorPrototype.remove;
VectorCursorPrototype.toString = MapCursorPrototype.toString;
VectorCursorPrototype.equals = MapCursorPrototype.equals;
VectorCursorPrototype.deref = MapCursorPrototype.deref;
VectorCursorPrototype.get = MapCursorPrototype.get;
VectorCursorPrototype.getIn = MapCursorPrototype.getIn;
VectorCursorPrototype.set = MapCursorPrototype.set;
VectorCursorPrototype.remove = MapCursorPrototype.remove;
VectorCursorPrototype.updateIn = MapCursorPrototype.updateIn;
VectorCursorPrototype.merge = MapCursorPrototype.merge;
VectorCursorPrototype.mergeWith = MapCursorPrototype.mergeWith;
VectorCursorPrototype.mergeDeep = MapCursorPrototype.mergeDeep;
VectorCursorPrototype.mergeDeepWith = MapCursorPrototype.mergeDeepWith;
VectorCursorPrototype.clear = MapCursorPrototype.clear;
VectorCursorPrototype.cursor = MapCursorPrototype.cursor;
VectorCursorPrototype.withMutations = MapCursorPrototype.withMutations;
VectorCursorPrototype.asMutable = MapCursorPrototype.asMutable;
VectorCursorPrototype.asImmutable = MapCursorPrototype.asImmutable;
VectorCursorPrototype.wasAltered = MapCursorPrototype.wasAltered;
VectorCursorPrototype.__iterate = MapCursorPrototype.__iterate;
VectorCursorPrototype.__iterator = MapCursorPrototype.__iterator;
VectorCursorPrototype.__ensureOwner = MapCursorPrototype.__ensureOwner;



class SetCursor extends Set {

  constructor(rootData, keyPath, onChange, length) {
    this.length = length;
    this._rootData = rootData;
    this._keyPath = keyPath;
    this._onChange = onChange;
  }

  add(value) {
    return updateCursor(this, s => s.add(value));
  }

  contains(value) {
    return value.deref().contains(value);
  }

  union(/*...seqs*/) {
    var args = arguments;
    return updateCursor(this, s => s.union.apply(s, args));
  }

  intersect(/*...seqs*/) {
    var args = arguments;
    return updateCursor(this, s => s.intersect.apply(s, args));
  }

  subtract(/*...seqs*/) {
    var args = arguments;
    return updateCursor(this, s => s.subtract.apply(s, args));
  }

  isSubset(seq) {
    return this.deref().isSubset(seq);
  }

  isSuperset(seq) {
    return this.deref().isSuperset(seq);
  }
}

var SetCursorPrototype = SetCursor.prototype;
SetCursorPrototype[DELETE] = SetCursorPrototype.remove = MapCursorPrototype.remove;
SetCursorPrototype.toString = MapCursorPrototype.toString;
SetCursorPrototype.equals = MapCursorPrototype.equals;
SetCursorPrototype.deref = MapCursorPrototype.deref;
SetCursorPrototype.get = MapCursorPrototype.get;
SetCursorPrototype.getIn = MapCursorPrototype.getIn;
SetCursorPrototype.remove = MapCursorPrototype.remove;
SetCursorPrototype.clear = MapCursorPrototype.clear;
SetCursorPrototype.withMutations = MapCursorPrototype.withMutations;
SetCursorPrototype.asMutable = MapCursorPrototype.asMutable;
SetCursorPrototype.asImmutable = MapCursorPrototype.asImmutable;
SetCursorPrototype.wasAltered = MapCursorPrototype.wasAltered;
SetCursorPrototype.__iterate = MapCursorPrototype.__iterate;
SetCursorPrototype.__iterator = MapCursorPrototype.__iterator;
SetCursorPrototype.__ensureOwner = MapCursorPrototype.__ensureOwner;



function makeCursor(rootData, keyPath, onChange, value) {
  value = value || rootData.getIn(keyPath, NOT_SET);
  if (value === NOT_SET || value instanceof Sequence) {
    var length = value && value.length;
    if (value instanceof Vector) {
      return new VectorCursor(rootData, keyPath, onChange, length);
    } else {
      return new MapCursor(rootData, keyPath, onChange, length);
    }
  } else {
    return value;
  }
}

function wrappedValue(cursor, key, value) {
  return value instanceof Sequence ? subCursor(cursor, key, value) : value;
}

function subCursor(cursor, key, value) {
  return makeCursor(
    cursor._rootData,
    cursor._keyPath.concat(key),
    cursor._onChange,
    value
  );
}

function updateCursor(cursor, changeFn, changeKey) {
  var rootData = cursor._rootData;
  var keyPath = cursor._keyPath;
  var onChange = cursor._onChange;

  var editPath = keyPath || [];
  if (arguments.length > 2) {
    editPath = editPath.concat(changeKey);
  }

  var updateIn = applyUpdateIn(keyPath, changeFn);
  var newRootData = typeof rootData.deref === 'function' ?
    updateCursor(rootData, updateIn, editPath) :
    updateIn(rootData);

  if (newRootData === rootData) {
    return rootData;
  }

  onChange && onChange(newRootData, rootData, editPath);
  return makeCursor(newRootData, keyPath, onChange);
}

function applyUpdateIn(keyPath, changeFn) {
  return function(collection) {
    return collection.updateIn(keyPath, Map.empty(), changeFn);
  };
}
