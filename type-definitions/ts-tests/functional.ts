import { expectError } from 'tsd';
import { get, has, set, remove, update } from 'immutable';

{
  // get

  // $ExpectType number | undefined
  get([1, 2, 3], 0);

  // $ExpectType number | "a"
  get([1, 2, 3], 0, 'a');

  // $ExpectType number | undefined
  get({ x: 10, y: 20 }, 'x');

  // $ExpectType number | "missing"
  get({ x: 10, y: 20 }, 'z', 'missing');
}

{
  // has

  // $ExpectType boolean
  has([1, 2, 3], 0);

  // $ExpectType boolean
  has({ x: 10, y: 20 }, 'x');
}

{
  // set

  // $ExpectType number[]
  set([1, 2, 3], 0, 10);

  expectError(set([1, 2, 3], 0, 'a'));

  expectError(set([1, 2, 3], 'a', 0));

  // $ExpectType { x: number; y: number; }
  set({ x: 10, y: 20 }, 'x', 100);

  expectError(set({ x: 10, y: 20 }, 'x', 'a'));
}

{
  // remove

  // $ExpectType number[]
  remove([1, 2, 3], 0);

  // $ExpectType { x: number; y: number; }
  remove({ x: 10, y: 20 }, 'x');
}

{
  // update

  // $ExpectType number[]
  update([1, 2, 3], 0, (v: number) => v + 1);

  expectError(update([1, 2, 3], 0, 1));

  expectError(update([1, 2, 3], 0, (v: string) => v + 'a'));

  expectError(update([1, 2, 3], 'a', (v: number) => v + 1));

  // $ExpectType { x: number; y: number; }
  update({ x: 10, y: 20 }, 'x', (v: number) => v + 1);

  expectError(update({ x: 10, y: 20 }, 'x', (v: string) => v + 'a'));
}
