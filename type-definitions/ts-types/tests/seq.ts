// TypeScript Version: 2.2.1

import { Seq } from '../../../';

{  // #constructor

  // $ExpectType Indexed<number>
  Seq([ 1, 2, 3 ]);
}

{  // #size

  // $ExpectType number | undefined
  Seq().size;

  // $ExpectError
  Seq().size = 10;
}
