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
import "TrieUtils"
import "Iterator"
/* global is, Sequence, Map, MapPrototype, NOT_SET, DELETE,
          ITERATE_ENTRIES, Iterator, iteratorDone, iteratorValue */
/* exported makeCursor */

class Cursor extends Sequence {
  constructor(rootData, keyPath, onChange, length) {
    this.length = length;
    this._rootData = rootData;
    this._keyPath = keyPath;
    this._onChange = onChange;
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
    return updateCursor(this, m => m && m.clear());
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
}

Cursor.prototype[DELETE] = Cursor.prototype.remove;
Cursor.prototype.update = MapPrototype.update;


function makeCursor(rootData, keyPath, onChange, value) {
  if (arguments.length < 4) {
    value = rootData.getIn(keyPath);
  }
  var length = value instanceof Sequence ? value.length : null;
  return new Cursor(rootData, keyPath, onChange, length);
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

  onChange && onChange(newRootData, rootData, editPath);

  return makeCursor(newRootData, keyPath, onChange);
}

function applyUpdateIn(keyPath, changeFn) {
  return function(collection) {
    return collection.updateIn(
      keyPath,
      prev => changeFn(prev instanceof Map ? prev : Map.empty())
    );
  };
}
