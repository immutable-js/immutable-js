import { Seq } from '../../';

{ // #constructor

  // $ExpectType Indexed<number>
  Seq([ 1, 2, 3 ]);

  // $ExpectType Indexed<[number, string]>
  Seq<[number, string]>([[1, 'number']]);
}

{ // #size

  // $ExpectType number | undefined
  Seq().size;

  // $ExpectError
  Seq().size = 10;
}
