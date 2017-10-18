/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import arrCopy from './arrCopy';
import hasOwnProperty from './hasOwnProperty';

export default function shallowCopy(from) {
  if (Array.isArray(from)) {
    return arrCopy(from);
  }
  const to = {};
  for (const key in from) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  if (typeof Object.getOwnPropertySymbols === 'function') {
    const symbols = Object.getOwnPropertySymbols(from);
    if (symbols.length > 0) {
      symbols.forEach(key => {
        to[key] = from[key];
      });
    }
  }
  return to;
}
