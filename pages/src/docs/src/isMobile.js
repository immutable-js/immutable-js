/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// TODO useless, always false
function isMobileMatch() {
  if (typeof window === 'undefined') {
    return false;
  }
  if (!window.matchMedia) {
    return false;
  }
  return window.matchMedia('(max-device-width: 680px)').matches;
}

export default !!isMobileMatch();
