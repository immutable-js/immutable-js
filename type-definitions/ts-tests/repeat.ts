import { Repeat } from 'immutable';

{
  // #constructor

  // $ExpectType Indexed<number>
  Repeat(0, 0);

  // $ExpectType Indexed<string>
  Repeat('a', 0);

  // $ExpectError
  Repeat('a', 'b');
}
