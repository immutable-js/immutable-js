/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Repeat } from '../../';

{
  // #constructor

  // $ExpectType Indexed<number>
  Repeat(0, 0);

  // $ExpectType Indexed<string>
  Repeat('a', 0);

  // $ExpectError
  Repeat('a', 'b');
}
