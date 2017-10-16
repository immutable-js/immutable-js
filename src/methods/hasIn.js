/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { hasIn as _hasIn } from '../functional/hasIn';

export function hasIn(searchKeyPath) {
  return _hasIn(this, searchKeyPath);
}
