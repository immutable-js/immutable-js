/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { updateIn as _updateIn } from '../functional/updateIn';

export function updateIn(keyPath, notSetValue, updater) {
  return _updateIn(this, keyPath, notSetValue, updater);
}
