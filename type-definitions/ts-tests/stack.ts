/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Stack } from '../../';

{
  // #constructor

  // $ExpectType Stack<unknown>
  Stack();

  const numberStack: Stack<number> = Stack<number>();
  const numberOrStringStack: Stack<number | string> = Stack([1, 'a']);

  // $ExpectError
  const invalidNumberStack: Stack<number> = Stack([1, 'a']);
}

{
  // #size

  // $ExpectType number
  Stack().size;

  // $ExpectError
  Stack().size = 10;
}

{
  // .of

  // $ExpectType Stack<number>
  Stack.of(1, 2, 3);

  // $ExpectError
  Stack.of<number>('a', 1);

  // $ExpectType Stack<string | number>
  Stack.of<number | string>('a', 1);
}

{
  // #peek

  // $ExpectType number | undefined
  Stack<number>().peek();
}

{
  // #push

  // $ExpectType Stack<number>
  Stack<number>().push(0);

  // $ExpectError
  Stack<number>().push('a');

  // $ExpectType Stack<string | number>
  Stack<number | string>().push(0);

  // $ExpectType Stack<string | number>
  Stack<number | string>().push('a');
}

{
  // #pushAll

  // $ExpectType Stack<number>
  Stack<number>().pushAll([0]);

  // $ExpectError
  Stack<number>().pushAll(['a']);

  // $ExpectType Stack<string | number>
  Stack<number | string>().pushAll([0]);

  // $ExpectType Stack<string | number>
  Stack<number | string>().pushAll(['a']);
}

{
  // #unshift

  // $ExpectType Stack<number>
  Stack<number>().unshift(0);

  // $ExpectError
  Stack<number>().unshift('a');

  // $ExpectType Stack<string | number>
  Stack<number | string>().unshift(0);

  // $ExpectType Stack<string | number>
  Stack<number | string>().unshift('a');
}

{
  // #unshiftAll

  // $ExpectType Stack<number>
  Stack<number>().unshiftAll([0]);

  // $ExpectError
  Stack<number>().unshiftAll(['a']);

  // $ExpectType Stack<string | number>
  Stack<number | string>().unshiftAll([1]);

  // $ExpectType Stack<string | number>
  Stack<number | string>().unshiftAll(['a']);
}

{
  // #clear

  // $ExpectType Stack<number>
  Stack<number>().clear();

  // $ExpectError
  Stack().clear(10);
}

{
  // #pop

  // $ExpectType Stack<number>
  Stack<number>().pop();

  // $ExpectError
  Stack().pop(10);
}

{
  // #shift

  // $ExpectType Stack<number>
  Stack<number>().shift();

  // $ExpectError
  Stack().shift(10);
}

{
  // #map

  // $ExpectType Stack<number>
  Stack<number>().map((value: number, key: number, iter: Stack<number>) => 1);

  // $ExpectType Stack<string>
  Stack<number>().map((value: number, key: number, iter: Stack<number>) => 'a');

  // $ExpectType Stack<number>
  Stack<number>().map<number>(
    (value: number, key: number, iter: Stack<number>) => 1
  );

  Stack<number>().map<string>(
    // $ExpectError
    (value: number, key: number, iter: Stack<number>) => 1
  );

  Stack<number>().map<number>(
    // $ExpectError
    (value: string, key: number, iter: Stack<number>) => 1
  );

  Stack<number>().map<number>(
    // $ExpectError
    (value: number, key: string, iter: Stack<number>) => 1
  );

  Stack<number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: Stack<string>) => 1
  );

  Stack<number>().map<number>(
    // $ExpectError
    (value: number, key: number, iter: Stack<number>) => 'a'
  );
}

{
  // #flatMap

  // $ExpectType Stack<number>
  Stack<number>().flatMap((value: number, key: number, iter: Stack<number>) => [
    1,
  ]);

  // $ExpectType Stack<string>
  Stack<number>().flatMap(
    (value: number, key: number, iter: Stack<number>) => 'a'
  );

  // $ExpectType Stack<number>
  Stack<number>().flatMap<number>(
    (value: number, key: number, iter: Stack<number>) => [1]
  );

  Stack<number>().flatMap<string>(
    // $ExpectError
    (value: number, key: number, iter: Stack<number>) => 1
  );

  Stack<number>().flatMap<number>(
    // $ExpectError
    (value: string, key: number, iter: Stack<number>) => 1
  );

  Stack<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: string, iter: Stack<number>) => 1
  );

  Stack<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: number, iter: Stack<string>) => 1
  );

  Stack<number>().flatMap<number>(
    // $ExpectError
    (value: number, key: number, iter: Stack<number>) => 'a'
  );
}

{
  // #flatten

  // $ExpectType Collection<unknown, unknown>
  Stack<number>().flatten();

  // $ExpectType Collection<unknown, unknown>
  Stack<number>().flatten(10);

  // $ExpectType Collection<unknown, unknown>
  Stack<number>().flatten(false);

  // $ExpectError
  Stack<number>().flatten('a');
}

{
  // #withMutations

  // $ExpectType Stack<number>
  Stack<number>().withMutations((mutable) => mutable);

  // $ExpectError
  Stack<number>().withMutations((mutable: Stack<string>) => mutable);
}

{
  // #asMutable

  // $ExpectType Stack<number>
  Stack<number>().asMutable();
}

{
  // #asImmutable

  // $ExpectType Stack<number>
  Stack<number>().asImmutable();
}
