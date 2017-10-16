/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { setIn as _setIn } from '../functional/setIn';

export function setIn(keyPath, v) {
  return _setIn(this, keyPath, v);
}
