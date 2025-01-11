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

test('Set.Indexed concat', () => {
  let s: Seq.Indexed<number> = Seq([1]);
  expect(s).type.toBe<Seq.Indexed<number>>();
  expect(s.concat([4, 5, 6])).type.toBe<Seq.Indexed<number>>();
  expect(s.concat(Seq([4, 5, 6]))).type.toBe<Seq.Indexed<number>>();
});

test('Set concat', () => {
  let s: Seq<unknown, unknown> = Seq([1]);
  expect(s).type.toBe<Seq<unknown, unknown>>();
  expect(s.concat([4, 5, 6])).type.toBe<Seq<unknown, unknown>>();
  expect(s.concat(Seq([4, 5, 6]))).type.toBe<Seq<unknown, unknown>>();
});
