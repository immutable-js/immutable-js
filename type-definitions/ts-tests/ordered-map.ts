/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OrderedMap, List } from '../../';

{
  // #constructor

  // $ExpectType OrderedMap<unknown, unknown>
  OrderedMap();

  // $ExpectType OrderedMap<number, string>
  OrderedMap([[1, 'a']]);

  // $ExpectType OrderedMap<number, string>
  OrderedMap(
    List<[number, string]>([[1, 'a']])
  );

  // $ExpectType OrderedMap<string, number>
  OrderedMap({ a: 1 });

  // $ExpectError
  const invalidNumberOrderedMap: OrderedMap<number, number> = OrderedMap();
}

{
  // #size

  // $ExpectType number
  OrderedMap().size;

  // $ExpectError
  OrderedMap().size = 10;
}

{
  // #get

  // $ExpectType number | undefined
  OrderedMap<number, number>().get(4);

  // $ExpectType number | "a"
  OrderedMap<number, number>().get(4, 'a');

  // $ExpectError
  OrderedMap<number, number>().get<number>(4, 'a');
}

{
  // #set

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().set(0, 0);

  // $ExpectError
  OrderedMap<number, number>().set(1, 'a');

  // $ExpectError
  OrderedMap<number, number>().set('a', 1);

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number | string>().set(0, 1);

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number | string>().set(0, 'a');
}

{
  // #setIn

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().setIn([], 0);
}

{
  // #delete

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().delete(0);

  // $ExpectError
  OrderedMap<number, number>().delete('a');
}

{
  // #deleteAll

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().deleteAll([0]);

  // $ExpectError
  OrderedMap<number, number>().deleteAll([0, 'a']);
}

{
  // #deleteIn

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().deleteIn([]);
}

{
  // #remove

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().remove(0);

  // $ExpectError
  OrderedMap<number, number>().remove('a');
}

{
  // #removeAll

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().removeAll([0]);

  // $ExpectError
  OrderedMap<number, number>().removeAll([0, 'a']);
}

{
  // #removeIn

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().removeIn([]);
}

{
  // #clear

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().clear();

  // $ExpectError
  OrderedMap().clear(10);
}

{
  // #update

  // $ExpectType number
  OrderedMap().update((v) => 1);

  // $ExpectError
  OrderedMap<number, number>().update((v: OrderedMap<string>) => v);

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().update(0, (v: number) => 0);

  // $ExpectError
  OrderedMap<number, number>().update(0, (v: number) => v + 'a');

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().update(1, 10, (v: number) => 0);

  // $ExpectError
  OrderedMap<number, number>().update(1, 'a', (v: number) => 0);

  // $ExpectError
  OrderedMap<number, number>().update(1, 10, (v: number) => v + 'a');
}

{
  // #updateIn

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().updateIn([], (v) => v);

  // $ExpectError
  OrderedMap<number, number>().updateIn([], 10);
}

{
  // #map

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().map(
    (value: number, key: number, iter: OrderedMap<number, number>) => 1
  );

  // $ExpectType OrderedMap<number, string>
  OrderedMap<number, number>().map(
    (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
  );

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().map<number>(
    (value: number, key: number, iter: OrderedMap<number, number>) => 1
  );

  OrderedMap<number, number>().map<string>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, number>) => 1
  );

  OrderedMap<number, number>().map<number>(
    // $ExpectError
    (value: string, key: number, iter: OrderedMap<number, number>) => 1
  );

  OrderedMap<number, number>().map<number>(
    // $ExpectError
    (value: number, key: string, iter: OrderedMap<number, number>) => 1
  );

  OrderedMap<number, number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, string>) => 1
  );

  OrderedMap<number, number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
  );
}

{
  // #mapKeys

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().mapKeys(
    (value: number, key: number, iter: OrderedMap<number, number>) => 1
  );

  // $ExpectType OrderedMap<string, number>
  OrderedMap<number, number>().mapKeys(
    (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
  );

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().mapKeys<number>(
    (value: number, key: number, iter: OrderedMap<number, number>) => 1
  );

  OrderedMap<number, number>().mapKeys<string>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, number>) => 1
  );

  OrderedMap<number, number>().mapKeys<number>(
    // $ExpectError
    (value: string, key: number, iter: OrderedMap<number, number>) => 1
  );

  OrderedMap<number, number>().mapKeys<number>(
    // $ExpectError
    (value: number, key: string, iter: OrderedMap<number, number>) => 1
  );

  OrderedMap<number, number>().mapKeys<number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, string>) => 1
  );

  OrderedMap<number, number>().mapKeys<number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
  );
}

{
  // #flatMap

  // $ExpectType OrderedMap<number, number>
  OrderedMap<
    number,
    number
  >().flatMap(
    (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
  );

  // $ExpectType OrderedMap<string, string>
  OrderedMap<
    number,
    number
  >().flatMap(
    (value: number, key: number, iter: OrderedMap<number, number>) => [
      ['a', 'b'],
    ]
  );

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().flatMap<number, number>(
    (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
  );

  OrderedMap<number, number>().flatMap<number, string>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
  );

  OrderedMap<number, number>().flatMap<number, number>(
    // $ExpectError
    (value: string, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
  );

  OrderedMap<number, number>().flatMap<number, number>(
    // $ExpectError
    (value: number, key: string, iter: OrderedMap<number, number>) => [[0, 1]]
  );

  OrderedMap<number, number>().flatMap<number, number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, string>) => [[0, 1]]
  );

  OrderedMap<number, number>().flatMap<number, number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 'a']]
  );
}

{
  // #merge

  // $ExpectType OrderedMap<string, number>
  OrderedMap<string, number>().merge({ a: 1 });

  // $ExpectType OrderedMap<string, number | { b: number; }>
  OrderedMap<string, number>().merge({ a: { b: 1 } });

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().merge(OrderedMap<number, number>());

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number>().merge(OrderedMap<number, string>());

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number | string>().merge(OrderedMap<number, string>());

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number | string>().merge(OrderedMap<number, number>());
}

{
  // #mergeIn

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().mergeIn([], []);
}

{
  // #mergeWith

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().mergeWith(
    (prev: number, next: number, key: number) => 1,
    OrderedMap<number, number>()
  );

  OrderedMap<number, number>().mergeWith(
    // $ExpectError
    (prev: string, next: number, key: number) => 1,
    OrderedMap<number, number>()
  );

  OrderedMap<number, number>().mergeWith(
    // $ExpectError
    (prev: number, next: string, key: number) => 1,
    OrderedMap<number, number>()
  );

  OrderedMap<number, number>().mergeWith(
    // $ExpectError
    (prev: number, next: number, key: string) => 1,
    OrderedMap<number, number>()
  );

  OrderedMap<number, number>().mergeWith(
    // $ExpectError
    (prev: number, next: number, key: number) => 'a',
    OrderedMap<number, number>()
  );

  OrderedMap<number, number>().mergeWith(
    (prev: number, next: number, key: number) => 1,
    // $ExpectError
    OrderedMap<number, string>()
  );

  // $ExpectType OrderedMap<string, number>
  OrderedMap<string, number>().mergeWith(
    (prev: number, next: number, key: string) => 1,
    { a: 1 }
  );

  OrderedMap<string, number>().mergeWith(
    (prev: number, next: number, key: string) => 1,
    // $ExpectError
    { a: 'a' }
  );

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number | string>().mergeWith(
    (prev: number | string, next: number | string, key: number) => 1,
    OrderedMap<number, string>()
  );
}

{
  // #mergeDeep

  // $ExpectType OrderedMap<string, number>
  OrderedMap<string, number>().mergeDeep({ a: 1 });

  // $ExpectError
  OrderedMap<string, number>().mergeDeep({ a: { b: 1 } });

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().mergeDeep(OrderedMap<number, number>());

  // $ExpectError
  OrderedMap<number, number>().mergeDeep(OrderedMap<number, string>());

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number | string>().mergeDeep(OrderedMap<number, string>());

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number | string>().mergeDeep(OrderedMap<number, number>());
}

{
  // #mergeDeepIn

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().mergeDeepIn([], []);
}

{
  // #mergeDeepWith

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().mergeDeepWith(
    (prev: unknown, next: unknown, key: unknown) => 1,
    OrderedMap<number, number>()
  );

  OrderedMap<number, number>().mergeDeepWith(
    // $ExpectError
    (prev: number, next: number, key: number) => 1,
    OrderedMap<number, string>()
  );

  // $ExpectType OrderedMap<string, number>
  OrderedMap<string, number>().mergeDeepWith(
    (prev: unknown, next: unknown, key: unknown) => 1,
    { a: 1 }
  );

  OrderedMap<string, number>().mergeDeepWith(
    // $ExpectError
    (prev: number, next: number, key: string) => 1,
    { a: 'a' }
  );

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number | string>().mergeDeepWith(
    (prev: unknown, next: unknown, key: unknown) => 1,
    OrderedMap<number, string>()
  );
}

{
  // #flip

  // $ExpectType OrderedMap<string, number>
  OrderedMap<number, string>().flip();
}

{
  // #withMutations

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().withMutations((mutable) => mutable);

  OrderedMap<number, number>().withMutations(
    // $ExpectError
    (mutable: OrderedMap<string>) => mutable
  );
}

{
  // #asMutable

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().asMutable();
}

{
  // #asImmutable

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().asImmutable();
}
