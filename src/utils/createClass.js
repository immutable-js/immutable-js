/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

export default function createClass(ctor, superClass) {
  if (superClass) {
    ctor.prototype = Object.create(superClass.prototype);
    var keyCopier = (key) => { ctor[key] = superClass[key] }
    Object.keys(superClass).forEach(keyCopier);
    Object.getOwnPropertySymbols &&
      Object.getOwnPropertySymbols(superClass).forEach(keyCopier);
  }
  ctor.prototype.constructor = ctor;
  return ctor
}
