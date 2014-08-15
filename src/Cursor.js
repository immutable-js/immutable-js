/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Map"
/* global Map */

class Cursor {
  constructor(rootData, keyPath, onChange) {
    this._rootData = rootData;
    this._keyPath = keyPath;
    this._onChange = onChange;
  }

  get(optKey, optNotFoundValue) {
    var deref = this._rootData.getIn(this._keyPath, Map.empty());
    return optKey ? deref.get(optKey, optNotFoundValue) : deref;
  }

  set(key, value) {
    return _updateCursor(this, m => m.set(key, value), key);
  }

  delete(key) {
    return _updateCursor(this, m => m.delete(key), key);
  }

  update(key, updater) {
    var changeFn;
    if (typeof key === 'function') {
      changeFn = key;
      key = undefined;
    } else {
      changeFn = x => x.update(key, updater);
    }
    return _updateCursor(this, changeFn, key);
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
}

function _updateCursor(cursor, changeFn, changeKey) {
  var newRootData = cursor._rootData.updateIn(cursor._keyPath, changeFn);
  var keyPath = cursor._keyPath || [];
  cursor._onChange && cursor._onChange.call(
    undefined,
    newRootData,
    cursor._rootData,
    changeKey ? keyPath.concat(changeKey) : keyPath
  );
  return new Cursor(newRootData, cursor._keyPath, cursor._onChange);
}
