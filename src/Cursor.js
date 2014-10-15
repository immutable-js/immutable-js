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
/* global is, Sequence, Map, NOT_SET, DELETE,
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

  update(keyOrFn, notSetValue, updater) {
    return arguments.length === 1 ?
      updateCursor(this, keyOrFn) :
      updateCursor(this, map => map.update(keyOrFn, notSetValue, updater), keyOrFn);
  }

  updateIn(keyPath, notSetValue, updater) {
    return updateCursor(this, m => m.updateIn(keyPath, notSetValue, updater), keyPath);
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
    return makeCursor(this, keyPath, onChange, this.deref().getIn(keyPath));
  }

  withMutations(fn) {
    return updateCursor(this, m => (m || Map.empty()).withMutations(fn));
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
  var updatingSelf =
    arguments.length < 3 ||
    (Array.isArray(changeKey) && changeKey.length === 0);
  var newRootData = cursor._rootData.updateIn(
    cursor._keyPath,
    updatingSelf ? undefined : Map.empty(),
    changeFn
  );
  var keyPath = cursor._keyPath || [];
  cursor._onChange && cursor._onChange.call(
    undefined,
    newRootData,
    cursor._rootData,
    updatingSelf ? keyPath : keyPath.concat(changeKey)
  );
  return makeCursor(newRootData, cursor._keyPath, cursor._onChange);
}
