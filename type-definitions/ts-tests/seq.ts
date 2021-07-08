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

  // $ExpectError
  Seq().size = 10;
}
