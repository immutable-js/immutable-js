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
    if (superClass.__proto__) {
      ctor.__proto__ = superClass
    } else {
      /*jshint forin:false */
      // Used for older IE's to emulate setting the __proto__
      for (var key in superClass) { ctor[key] = superClass[key]; }
    }
  }
  ctor.prototype.constructor = ctor;
  return ctor
}
