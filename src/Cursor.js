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
/* global is, Sequence, KeyedSequence, IndexedSequence, Map, NOT_SET, DELETE,
          ITERATE_ENTRIES, Iterator, iteratorDone, iteratorValue */
/* exported makeCursor */

class Cursor extends KeyedSequence {
  constructor(rootData, keyPath, onChange, size) {
    this.size = size;
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
    if (Array.isArray(key) && key.length === 0) {
      return this;
    }
    var value = this._rootData.getIn(this._keyPath.concat(key), NOT_SET);
    return value === NOT_SET ? notSetValue : wrappedValue(this, key, value);
  }

  set(key, value) {
    return updateCursor(this, m => m.set(key, value), key);
  }

  remove(key) {
    return updateCursor(this, m => m.remove(key), key);
  }

  clear() {
    return updateCursor(this, m => m.clear());
  }

  update(keyOrFn, notSetValue, updater) {
    return arguments.length === 1 ?
      updateCursor(this, keyOrFn) :
      updateCursor(this, map => map.update(keyOrFn, notSetValue, updater), keyOrFn);
  }

  withMutations(fn) {
    return updateCursor(this, m => (m || Map.empty()).withMutations(fn));
  }

  cursor(subKey) {
    return Array.isArray(subKey) && subKey.length === 0 ?
      this : subCursor(this, subKey);
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

var CursorPrototype = Cursor.prototype;
CursorPrototype[DELETE] = CursorPrototype.remove;
CursorPrototype.getIn = CursorPrototype.get;


class IndexedCursor extends IndexedSequence {
  constructor(rootData, keyPath, onChange, size) {
    this.size = size;
    this._rootData = rootData;
    this._keyPath = keyPath;
    this._onChange = onChange;
  }
}

var IndexedCursorPrototype = IndexedCursor.prototype;
IndexedCursorPrototype.equals = CursorPrototype.equals;
IndexedCursorPrototype.deref = CursorPrototype.deref;
IndexedCursorPrototype.get = CursorPrototype.get;
IndexedCursorPrototype.getIn = CursorPrototype.getIn;
IndexedCursorPrototype.set = CursorPrototype.set;
IndexedCursorPrototype[DELETE] =
  IndexedCursorPrototype.remove = CursorPrototype.remove;
IndexedCursorPrototype.clear = CursorPrototype.clear;
IndexedCursorPrototype.update = CursorPrototype.update;
IndexedCursorPrototype.withMutations = CursorPrototype.withMutations;
IndexedCursorPrototype.cursor = CursorPrototype.cursor;
IndexedCursorPrototype.__iterate = CursorPrototype.__iterate;
IndexedCursorPrototype.__iterator = CursorPrototype.__iterator;


function makeCursor(rootData, keyPath, onChange, value) {
  if (arguments.length < 4) {
    value = rootData.getIn(keyPath);
  }
  var size = value instanceof Sequence ? value.size : undefined;
  var CursorClass = value instanceof IndexedSequence ? IndexedCursor : Cursor;
  return new CursorClass(rootData, keyPath, onChange, size);
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
  var newRootData = cursor._rootData.updateIn(
    cursor._keyPath,
    changeKey ? Map.empty() : undefined,
    changeFn
  );
  var keyPath = cursor._keyPath || [];
  cursor._onChange && cursor._onChange.call(
    undefined,
    newRootData,
    cursor._rootData,
    changeKey ? keyPath.concat(changeKey) : keyPath
  );
  return makeCursor(newRootData, cursor._keyPath, cursor._onChange);
}
