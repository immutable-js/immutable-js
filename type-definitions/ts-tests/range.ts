import { Range } from 'immutable';

{
  // #constructor

  // $ExpectType Indexed<number>
  Range(0, 0, 1);

  // $ExpectError
  Range('a', 0, 0);

  // $ExpectError
  Range();

  // $ExpectError
  Range(1);
}
