/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/* exported mixin */

/**
 * Contributes additional methods to a constructor
 */
function mixin(ctor, methods) {
  var proto = ctor.prototype;
  Object.keys(methods).forEach(function (key) {
    proto[key] = methods[key];
  });
  return ctor;
}
