/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mergeWithSources } from '../functional/merge';
import { updateIn } from '../functional/updateIn';
import { emptyMap } from '../Map';

export function mergeIn(keyPath, ...iters) {
  return updateIn(this, keyPath, emptyMap(), (m) => mergeWithSources(m, iters));
}
