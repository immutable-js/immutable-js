import { expectError } from 'tsd';
import { Range } from 'immutable';

{
  // #constructor

  // $ExpectType Indexed<number>
  Range(0, 0, 1);

  expectError(Range('a', 0, 0));

  expectError(Range());

  expectError(Range(1));
}
