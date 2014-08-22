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
/* global Map, Sequence, NOT_SET */

class Cursor extends Sequence {
  constructor(rootData, keyPath, onChange) {
    var value = rootData.getIn(keyPath);
    this.length = value instanceof Sequence ? value.length : null;
    this._rootData = rootData;
    this._keyPath = keyPath;
    this._onChange = onChange;
  }

  deref(notSetValue) {
    return this._rootData.getIn(this._keyPath, notSetValue);
  }

  get(key, notSetValue) {
    return this.getIn([key], notSetValue);
  }

  getIn(keyPath, notSetValue) {
    if (!keyPath || !keyPath.length) {
      return this;
    }
    var value = this._rootData.getIn(
      (this._keyPath || []).concat(keyPath),
      NOT_SET
    );
    return value === NOT_SET ? notSetValue :
      value instanceof Sequence ? this.cursor(keyPath) :
      value;
  }

  set(key, value) {
    return _updateCursor(this, m => m.set(key, value), key);
  }

  delete(key) {
    return _updateCursor(this, m => m.delete(key), key);
  }

  update(key, notSetValue, updater) {
    return arguments.length === 1 ?
      _updateCursor(this, key) :
      _updateCursor(this, map => map.update(key, notSetValue, updater), key);
  }

  cursor(subKeyPath) {
    if (subKeyPath && !Array.isArray(subKeyPath)) {
      subKeyPath = [subKeyPath];
    }
    if (!subKeyPath || subKeyPath.length === 0) {
      return this;
    }
    return new Cursor(
      this._rootData,
      this._keyPath ? this._keyPath.concat(subKeyPath) : subKeyPath,
      this._onChange
    );
  }

  __iterate() {
    var value = this.deref();
    return value && value.__iterate ? value.__iterate.apply(value, arguments) : 0;
  }
}

function _updateCursor(cursor, changeFn, changeKey) {
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
