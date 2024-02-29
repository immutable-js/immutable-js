import { expect, test } from 'tstyche';
import { Repeat, Seq } from 'immutable';

test('#constructor', () => {
  expect(Repeat(0, 0)).type.toEqual<Seq.Indexed<number>>();

  expect(Repeat('a', 0)).type.toEqual<Seq.Indexed<string>>();

  expect(Repeat('a', 'b')).type.toRaiseError();
});
