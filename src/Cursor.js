/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Map"
import "Sequence"
import "TrieUtils"
import "Symbol"
/* global Map, Sequence, NOT_SET, DELETE */

class Cursor extends Sequence {
  constructor(rootData, keyPath, onChange, value) {
    value = value ? value : rootData.getIn(keyPath);
    this.length = value instanceof Sequence ? value.length : null;
    this._rootData = rootData;
    this._keyPath = keyPath;
    this._onChange = onChange;
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
    return updateCursor(this, m => m.withMutations(fn));
  }

  cursor(subKey) {
    return Array.isArray(subKey) && subKey.length === 0 ?
      this : subCursor(this, subKey);
  }

  __iterate(fn, reverse, flipIndices) {
    var cursor = this;
    var deref = cursor.deref();
    return deref && deref.__iterate ? deref.__iterate(
      (value, key, collection) => fn(wrappedValue(cursor, key, value), key, collection),
      reverse,
      flipIndices
    ) : 0;
  }
}

Cursor.prototype[DELETE] = Cursor.prototype.remove;
Cursor.prototype.getIn = Cursor.prototype.get;

function wrappedValue(cursor, key, value) {
  return value instanceof Sequence ? subCursor(cursor, key, value) : value;
}

function subCursor(cursor, key, value) {
  return new Cursor(
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
  return new Cursor(newRootData, cursor._keyPath, cursor._onChange);
}
