import { expect, pick, test } from 'tstyche';
import { Seq } from 'immutable';

test('#constructor', () => {
  expect(Seq([1, 2, 3])).type.toBe<Seq.Indexed<number>>();
});

test('#size', () => {
  expect(pick(Seq(), 'size')).type.toBe<{
    readonly size: number | undefined;
  }>();
});
