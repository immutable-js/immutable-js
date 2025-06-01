import { Range, Seq } from 'immutable';
import { expect, test } from 'tstyche';

test('#constructor', () => {
  expect(Range(0, 0, 1)).type.toBe<Seq.Indexed<number>>();

  expect(Range('a', 0, 0)).type.toRaiseError();

  expect(Range()).type.toRaiseError();

  expect(Range(1)).type.toRaiseError();
});
