/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Set, Map } from '../../';

{
  // #constructor

  // $ExpectType Set<unknown>
  Set();

  const numberSet: Set<number> = Set<number>();
  const numberOrStringSet: Set<number | string> = Set([1, 'a']);

  // $ExpectError
  const invalidNumberSet: Set<number> = Set([1, 'a']);
}

{
  // #size

  // $ExpectType number
  Set().size;

  // $ExpectError
  Set().size = 10;
}

{
  // .of

  // $ExpectType Set<number>
  Set.of(1, 2, 3);

  // $ExpectError
  Set.of<number>('a', 1);

  // $ExpectType Set<string | number>
  Set.of<number | string>('a', 1);
}

{
  // .fromKeys

  // $ExpectType Set<string>
  Set.fromKeys(Map<number, string>());

  // $ExpectType Set<number>
  Set.fromKeys<number>(Map<number, string>());

  // $ExpectType Set<string>
  Set.fromKeys({ a: 1 });

  // $ExpectError
  Set.fromKeys<number>(Map<string, string>());

  // $ExpectType Set<string | number>
  Set.fromKeys<number | string>(Map<number | string, string>());
}

{
  // #get

  // $ExpectType number | undefined
  Set<number>().get(4);

  // $ExpectType number | "a"
  Set<number>().get(4, 'a');

  // $ExpectError
  Set<number>().get<number>(4, 'a');
}

{
  // #delete

  // $ExpectType Set<number>
  Set<number>().delete(0);

  // $ExpectError
  Set<number>().delete('a');
}
{
  // #remove

  // $ExpectType Set<number>
  Set<number>().remove(0);

  // $ExpectError
  Set<number>().remove('a');
}

{
  // #clear

  // $ExpectType Set<number>
  Set<number>().clear();

  // $ExpectError
  Set().clear(10);
}

{
  // #map

  // $ExpectType Set<number>
  Set<number>().map((value: number, key: number, iter: Set<number>) => 1);

  // $ExpectType Set<string>
  Set<number>().map((value: number, key: number, iter: Set<number>) => 'a');

  // $ExpectType Set<number>
  Set<number>().map<number>(
    (value: number, key: number, iter: Set<number>) => 1
  );

  Set<number>().map<string>(
    // $ExpectError
    (value: number, key: number, iter: Set<number>) => 1
  );

  Set<number>().map<number>(
    // $ExpectError
    (value: string, key: number, iter: Set<number>) => 1
  );

  Set<number>().map<number>(
    // $ExpectError
    (value: number, key: string, iter: Set<number>) => 1
  );

  Set<number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: Set<string>) => 1
  );

  Set<number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: Set<number>) => 'a'
  );
}

{
  // #flatMap

  // $ExpectType Set<number>
  Set<number>().flatMap((value: number, key: number, iter: Set<number>) => [1]);

  // $ExpectType Set<string>
  Set<number>().flatMap((value: number, key: number, iter: Set<number>) => [
    'a',
  ]);

  // $ExpectType Set<number>
  Set<number>().flatMap<number>(
    (value: number, key: number, iter: Set<number>) => [1]
  );

  Set<number>().flatMap<string>(
    // $ExpectError
    (value: number, key: number, iter: Set<number>) => [1]
  );

  Set<number>().flatMap<number>(
    // $ExpectError
    (value: string, key: number, iter: Set<number>) => [1]
  );

  Set<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: string, iter: Set<number>) => [1]
  );

  Set<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: number, iter: Set<string>) => [1]
  );

  Set<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: number, iter: Set<number>) => ['a']
  );
}

{
  // #union

  // $ExpectType Set<number>
  Set<number>().union(Set<number>());

  // $ExpectType Set<string | number>
  Set<number>().union(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().union(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().union(Set<number>());
}

{
  // #merge

  // $ExpectType Set<number>
  Set<number>().merge(Set<number>());

  // $ExpectType Set<string | number>
  Set<number>().merge(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().merge(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().merge(Set<number>());
}

{
  // #intersect

  // $ExpectType Set<number>
  Set<number>().intersect(Set<number>());

  // $ExpectError
  Set<number>().intersect(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().intersect(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().intersect(Set<number>());
}

{
  // #subtract

  // $ExpectType Set<number>
  Set<number>().subtract(Set<number>());

  // $ExpectError
  Set<number>().subtract(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().subtract(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().subtract(Set<number>());
}

{
  // #flatten

  // $ExpectType Collection<unknown, unknown>
  Set<number>().flatten();

  // $ExpectType Collection<unknown, unknown>
  Set<number>().flatten(10);

  // $ExpectType Collection<unknown, unknown>
  Set<number>().flatten(false);

  // $ExpectError
  Set<number>().flatten('a');
}

{
  // #withMutations

  // $ExpectType Set<number>
  Set<number>().withMutations((mutable) => mutable);

  // $ExpectError
  Set<number>().withMutations((mutable: Set<string>) => mutable);
}

{
  // #asMutable

  // $ExpectType Set<number>
  Set<number>().asMutable();
}

{
  // #asImmutable

  // $ExpectType Set<number>
  Set<number>().asImmutable();
}
