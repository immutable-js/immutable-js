/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Range } from '../../';

{
  // #constructor

  // $ExpectType Indexed<number>
  Range(0, 0, 0);

  // $ExpectError
  Range('a', 0, 0);
}
