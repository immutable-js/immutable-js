/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function createClass(ctor, superClass) {
  if (superClass) {
    ctor.prototype = Object.create(superClass.prototype);
  }
  ctor.prototype.constructor = ctor;
}
