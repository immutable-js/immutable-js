import { expectType, expectError } from 'tsd';
import { get, has, set, remove, update } from 'immutable';

{
  // get

  expectType<number | undefined>(get([1, 2, 3], 0));

  expectType<number | "a">(get([1, 2, 3], 0, 'a'));

  expectType<number | undefined>(get({ x: 10, y: 20 }, 'x'));

  expectType<number | "missing">(get({ x: 10, y: 20 }, 'z', 'missing'));
}

{
  // has

  expectType<boolean>(has([1, 2, 3], 0));

  expectType<boolean>(has({ x: 10, y: 20 }, 'x'));
}

{
  // set

  expectType<number[]>(set([1, 2, 3], 0, 10));

  expectError(set([1, 2, 3], 0, 'a'));

  expectError(set([1, 2, 3], 'a', 0));

  expectType<{ x: number; y: number; }>(set({ x: 10, y: 20 }, 'x', 100));

  expectError(set({ x: 10, y: 20 }, 'x', 'a'));
}

{
  // remove

  expectType<number[]>(remove([1, 2, 3], 0));

  expectType<{ x: number; y: number; }>(remove({ x: 10, y: 20 }, 'x'));
}

{
  // update

  expectType<number[]>(update([1, 2, 3], 0, (v: number) => v + 1));

  expectError(update([1, 2, 3], 0, 1));

  expectError(update([1, 2, 3], 0, (v: string) => v + 'a'));

  expectError(update([1, 2, 3], 'a', (v: number) => v + 1));

  expectType<{ x: number; y: number; }>(update({ x: 10, y: 20 }, 'x', (v: number) => v + 1));

  expectError(update({ x: 10, y: 20 }, 'x', (v: string) => v + 'a'));
}
