/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OrderedSet, Map } from '../../';

{
  // #constructor

  // $ExpectType OrderedSet<unknown>
  OrderedSet();

  const numberOrderedSet: OrderedSet<number> = OrderedSet<number>();
  const numberOrStringOrderedSet: OrderedSet<number | string> = OrderedSet([
    1,
    'a',
  ]);

  // $ExpectError
  const invalidNumberOrderedSet: OrderedSet<number> = OrderedSet([1, 'a']);
}

{
  // #size

  // $ExpectType number
  OrderedSet().size;

  // $ExpectError
  OrderedSet().size = 10;
}

{
  // .of

  // $ExpectType OrderedSet<number>
  OrderedSet.of(1, 2, 3);

  // $ExpectError
  OrderedSet.of<number>('a', 1);

  // $ExpectType OrderedSet<string | number>
  OrderedSet.of<number | string>('a', 1);
}

{
  // .fromKeys

  // $ExpectType OrderedSet<string>
  OrderedSet.fromKeys(Map<number, string>());

  // $ExpectType OrderedSet<number>
  OrderedSet.fromKeys<number>(Map<number, string>());

  // $ExpectType OrderedSet<string>
  OrderedSet.fromKeys({ a: 1 });

  // $ExpectError
  OrderedSet.fromKeys<number>(Map<string, string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet.fromKeys<number | string>(Map<number | string, string>());
}

{
  // #get

  // $ExpectType number | undefined
  OrderedSet<number>().get(4);

  // $ExpectType number | "a"
  OrderedSet<number>().get(4, 'a');

  // $ExpectError
  OrderedSet<number>().get<number>(4, 'a');
}

{
  // #delete

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().delete(0);

  // $ExpectError
  OrderedSet<number>().delete('a');
}
{
  // #remove

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().remove(0);

  // $ExpectError
  OrderedSet<number>().remove('a');
}

{
  // #clear

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().clear();

  // $ExpectError
  OrderedSet().clear(10);
}

{
  // #map

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().map(
    (value: number, key: number, iter: OrderedSet<number>) => 1
  );

  // $ExpectType OrderedSet<string>
  OrderedSet<number>().map(
    (value: number, key: number, iter: OrderedSet<number>) => 'a'
  );

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().map<number>(
    (value: number, key: number, iter: OrderedSet<number>) => 1
  );

  OrderedSet<number>().map<string>(
    // $ExpectError
    (value: number, key: number, iter: OrderedSet<number>) => 1
  );

  OrderedSet<number>().map<number>(
    // $ExpectError
    (value: string, key: number, iter: OrderedSet<number>) => 1
  );

  OrderedSet<number>().map<number>(
    // $ExpectError
    (value: number, key: string, iter: OrderedSet<number>) => 1
  );

  OrderedSet<number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedSet<string>) => 1
  );

  OrderedSet<number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedSet<number>) => 'a'
  );
}

{
  // #flatMap

  // $ExpectType OrderedSet<number>
  OrderedSet<
    number
  >().flatMap((value: number, key: number, iter: OrderedSet<number>) => [1]);

  // $ExpectType OrderedSet<string>
  OrderedSet<
    number
  >().flatMap((value: number, key: number, iter: OrderedSet<number>) => ['a']);

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().flatMap<number>(
    (value: number, key: number, iter: OrderedSet<number>) => [1]
  );

  OrderedSet<number>().flatMap<string>(
    // $ExpectError
    (value: number, key: number, iter: OrderedSet<number>) => [1]
  );

  OrderedSet<number>().flatMap<number>(
    // $ExpectError
    (value: string, key: number, iter: OrderedSet<number>) => [1]
  );

  OrderedSet<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: string, iter: OrderedSet<number>) => [1]
  );

  OrderedSet<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedSet<string>) => [1]
  );

  OrderedSet<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: number, iter: OrderedSet<number>) => ['a']
  );
}

{
  // #union

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().union(OrderedSet<number>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number>().union(OrderedSet<string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number | string>().union(OrderedSet<string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number | string>().union(OrderedSet<number>());
}

{
  // #merge

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().merge(OrderedSet<number>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number>().merge(OrderedSet<string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number | string>().merge(OrderedSet<string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number | string>().merge(OrderedSet<number>());
}

{
  // #intersect

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().intersect(OrderedSet<number>());

  // $ExpectError
  OrderedSet<number>().intersect(OrderedSet<string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number | string>().intersect(OrderedSet<string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number | string>().intersect(OrderedSet<number>());
}

{
  // #subtract

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().subtract(OrderedSet<number>());

  // $ExpectError
  OrderedSet<number>().subtract(OrderedSet<string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number | string>().subtract(OrderedSet<string>());

  // $ExpectType OrderedSet<string | number>
  OrderedSet<number | string>().subtract(OrderedSet<number>());
}

{
  // #flatten

  // $ExpectType Collection<unknown, unknown>
  OrderedSet<number>().flatten();

  // $ExpectType Collection<unknown, unknown>
  OrderedSet<number>().flatten(10);

  // $ExpectType Collection<unknown, unknown>
  OrderedSet<number>().flatten(false);

  // $ExpectError
  OrderedSet<number>().flatten('a');
}

{
  // #withMutations

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().withMutations((mutable) => mutable);

  // $ExpectError
  OrderedSet<number>().withMutations((mutable: OrderedSet<string>) => mutable);
}

{
  // #asMutable

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().asMutable();
}

{
  // #asImmutable

  // $ExpectType OrderedSet<number>
  OrderedSet<number>().asImmutable();
}
