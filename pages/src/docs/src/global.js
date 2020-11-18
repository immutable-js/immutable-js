/**
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function getGlobalData() {
  if (typeof document === 'undefined') {
    // pre-rendering, injected by gulp
    return global.data;
  }
  return window.data;
}
