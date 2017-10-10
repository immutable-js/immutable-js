/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { updateIn } from './updateIn';
import { NOT_SET } from '../TrieUtils';

export function removeIn(collection, keyPath) {
  return updateIn(collection, keyPath, () => NOT_SET);
}

/*
keyPath = [...coerceKeyPath(keyPath)];
if (keyPath.length) {
  const lastKey = keyPath.pop();
  return this.updateIn(keyPath, c => c && c.remove(lastKey));
}
*/
