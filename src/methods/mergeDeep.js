/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mergeDeepWithSources } from '../functional/merge';

export function mergeDeep(...iters) {
  return mergeDeepWithSources(this, iters);
}

export function mergeDeepWith(merger, ...iters) {
  return mergeDeepWithSources(this, iters, merger);
}
