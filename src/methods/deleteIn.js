/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { removeIn } from '../functional/removeIn';

export function deleteIn(keyPath) {
  return removeIn(this, keyPath);
}
