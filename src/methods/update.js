/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { update as _update } from '../functional/update';

export function update(key, notSetValue, updater) {
  return arguments.length === 1
    ? key(this)
    : _update(this, key, notSetValue, updater);
}
