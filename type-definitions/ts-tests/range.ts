import { expectType, expectError } from 'tsd';
import { Range, Seq } from 'immutable';

{
  // #constructor

  expectType<Seq.Indexed<number>>(Range(0, 0, 1));

  expectError(Range('a', 0, 0));

  expectError(Range());

  expectError(Range(1));
}
