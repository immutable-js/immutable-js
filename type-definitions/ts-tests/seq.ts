import { expectError } from 'tsd';
import { Seq } from 'immutable';

{
  // #constructor

  // $ExpectType Indexed<number>
  Seq([1, 2, 3]);
}

{
  // #size

  // $ExpectType number | undefined
  Seq().size;

  expectError((Seq().size = 10));
}
