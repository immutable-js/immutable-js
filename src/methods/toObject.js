/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assertNotInfinite from '../utils/assertNotInfinite';

export function toObject() {
  assertNotInfinite(this.size);
  const object = {};
  this.__iterate((v, k) => {
    object[k] = v;
  });
  return object;
}
