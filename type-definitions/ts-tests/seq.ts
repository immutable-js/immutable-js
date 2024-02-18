import { expectType, expectError } from 'tsd';
import { Seq } from 'immutable';

{
  // #constructor

  expectType<Seq.Indexed<number>>(Seq([1, 2, 3]));
}

{
  // #size

  expectType<number | undefined>(Seq().size);

  expectError((Seq().size = 10));
}
