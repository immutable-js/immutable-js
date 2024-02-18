import { expectType, expectError } from 'tsd';
import { Repeat, Seq } from 'immutable';

{
  // #constructor

  expectType<Seq.Indexed<number>>(Repeat(0, 0));

  expectType<Seq.Indexed<string>>(Repeat('a', 0));

  expectError(Repeat('a', 'b'));
}
