/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var isMobile =
  window.matchMedia && window.matchMedia('(max-device-width: 680px)');
module.exports = false && !!(isMobile && isMobile.matches);
