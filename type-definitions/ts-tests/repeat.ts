import { Repeat, Seq } from 'immutable';
import { expect, test } from 'tstyche';

test('#constructor', () => {
  expect(Repeat(0, 0)).type.toBe<Seq.Indexed<number>>();

  expect(Repeat('a', 0)).type.toBe<Seq.Indexed<string>>();

  expect(Repeat('a', 'b')).type.toRaiseError();
});
