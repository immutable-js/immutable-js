import { Range } from 'immutable';

{
  // #constructor

  // $ExpectType Indexed<number>
  Range(0, 0, 0);

  // $ExpectError
  Range('a', 0, 0);
}
