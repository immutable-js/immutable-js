/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  mergeDeep as _mergeDeep,
  mergeDeepWith as _mergeDeepWith
} from '../functional/merge';

export function mergeDeep(...iters) {
  return _mergeDeep(this, ...iters);
}

export function mergeDeepWith(merger, ...iters) {
  return _mergeDeepWith(merger, this, ...iters);
}
