import { expect, test } from 'tstyche';
import { get, has, set, remove, update } from 'immutable';

test('get', () => {
  expect(get([1, 2, 3], 0)).type.toBe<number | undefined>();

  expect(get([1, 2, 3], 0, 'a')).type.toBe<number | 'a'>();

  expect(get({ x: 10, y: 20 }, 'x')).type.toBe<number | undefined>();

  expect(get({ x: 10, y: 20 }, 'z', 'missing')).type.toBe<number | 'missing'>();
});

test('has', () => {
  expect(has([1, 2, 3], 0)).type.toBeBoolean();

  expect(has({ x: 10, y: 20 }, 'x')).type.toBeBoolean();
});

test('set', () => {
  expect(set([1, 2, 3], 0, 10)).type.toBe<number[]>();

  expect(set([1, 2, 3], 0, 'a')).type.toRaiseError();

  expect(set([1, 2, 3], 'a', 0)).type.toRaiseError();

  expect(set({ x: 10, y: 20 }, 'x', 100)).type.toBe<{
    x: number;
    y: number;
  }>();

  expect(set({ x: 10, y: 20 }, 'x', 'a')).type.toRaiseError();
});

test('remove', () => {
  expect(remove([1, 2, 3], 0)).type.toBe<number[]>();

  expect(remove({ x: 10, y: 20 }, 'x')).type.toBe<{
    x: number;
    y: number;
  }>();
});

test('update', () => {
  expect(update([1, 2, 3], 0, (v: number) => v + 1)).type.toBe<number[]>();

  expect(update([1, 2, 3], 0, 1)).type.toRaiseError();

  expect(update([1, 2, 3], 0, (v: string) => v + 'a')).type.toRaiseError();

  expect(update([1, 2, 3], 'a', (v: number) => v + 1)).type.toRaiseError();

  expect(update({ x: 10, y: 20 }, 'x', (v: number) => v + 1)).type.toBe<{
    x: number;
    y: number;
  }>();

  expect(
    update({ x: 10, y: 20 }, 'x', (v: string) => v + 'a')
  ).type.toRaiseError();
});
