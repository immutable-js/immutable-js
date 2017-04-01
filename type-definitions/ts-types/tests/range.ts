// TypeScript Version: 2.2.1

import { Range } from '../../../';

{  // #constructor

    // $ExpectType Indexed<number>
    Range(0, 0, 0);

    // $ExpectError
    Range('a', 0, 0);
}
