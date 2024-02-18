import { expectError } from 'tsd';
import { Repeat } from 'immutable';

{
  // #constructor

  // $ExpectType Indexed<number>
  Repeat(0, 0);

  // $ExpectType Indexed<string>
  Repeat('a', 0);

  expectError(Repeat('a', 'b'));
}
