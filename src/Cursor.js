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

  get() {
    return this._rootData.getIn(this._keyPath, Map.empty());
  }

  update(updater) {
    var newRootData = this._rootData.updateIn(this._keyPath, updater);
    var onChange = this._onChange;
    onChange && onChange.call(undefined, newRootData, this._rootData);
    return new Cursor(newRootData, this._keyPath, onChange);
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
