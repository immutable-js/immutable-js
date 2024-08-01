import { expect, test } from 'tstyche';
import { Seq } from 'immutable';

test('#constructor', () => {
  expect(Seq([1, 2, 3])).type.toBe<Seq.Indexed<number>>();
});

test('#size', () => {
  expect(Seq().size).type.toBe<number | undefined>();

  expect(Seq()).type.toMatch<{ readonly size: number | undefined }>();
});
