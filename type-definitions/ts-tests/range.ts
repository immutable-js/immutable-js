import { expect, test } from 'tstyche';
import { Range, Seq } from 'immutable';

test('#constructor', () => {
  expect(Range(0, 0, 1)).type.toEqual<Seq.Indexed<number>>();

  expect(Range('a', 0, 0)).type.toRaiseError();

  expect(Range()).type.toRaiseError();

  expect(Range(1)).type.toRaiseError();
});
