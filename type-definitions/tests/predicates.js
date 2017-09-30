/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { List } from '../../';

declare var mystery: mixed;

// $ExpectError
maybe.push('3');

if (mystery instanceof List) {
  maybe.push('3');
}

// Note: Flow's support for %checks is still experimental.
// Support this in the future.
// if (List.isList(mystery)) {
//   mystery.push('3');
// }
