/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Stretch } from '../../';

{  // #constructor

    // $ExpectType Indexed<number>
    Stretch(1, 1, 1);

    // $ExpectError
    Stretch('b', 1, 1);
}
