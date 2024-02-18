import { expectError, expectNotAssignable } from 'tsd';
import { Stack } from 'immutable';

{
  // #constructor

  // $ExpectType Stack<unknown>
  Stack();

  const numberStack: Stack<number> = Stack<number>();
  const numberOrStringStack: Stack<number | string> = Stack([1, 'a']);

  // Invalid number stack
  expectNotAssignable<Stack<number>>(Stack([1, 'a']));
}

{
  // #size

  // $ExpectType number
  Stack().size;

  expectError((Stack().size = 10));
}

{
  // .of

  // $ExpectType Stack<number>
  Stack.of(1, 2, 3);

  expectError(Stack.of<number>('a', 1));

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

  expectError(Stack<number>().push('a'));

  // $ExpectType Stack<string | number>
  Stack<number | string>().push(0);

  // $ExpectType Stack<string | number>
  Stack<number | string>().push('a');
}

{
  // #pushAll

  // $ExpectType Stack<number>
  Stack<number>().pushAll([0]);

  expectError(Stack<number>().pushAll(['a']));

  // $ExpectType Stack<string | number>
  Stack<number | string>().pushAll([0]);

  // $ExpectType Stack<string | number>
  Stack<number | string>().pushAll(['a']);
}

{
  // #unshift

  // $ExpectType Stack<number>
  Stack<number>().unshift(0);

  expectError(Stack<number>().unshift('a'));

  // $ExpectType Stack<string | number>
  Stack<number | string>().unshift(0);

  // $ExpectType Stack<string | number>
  Stack<number | string>().unshift('a');
}

{
  // #unshiftAll

  // $ExpectType Stack<number>
  Stack<number>().unshiftAll([0]);

  expectError(Stack<number>().unshiftAll(['a']));

  // $ExpectType Stack<string | number>
  Stack<number | string>().unshiftAll([1]);

  // $ExpectType Stack<string | number>
  Stack<number | string>().unshiftAll(['a']);
}

{
  // #clear

  // $ExpectType Stack<number>
  Stack<number>().clear();

  expectError(Stack().clear(10));
}

{
  // #pop

  // $ExpectType Stack<number>
  Stack<number>().pop();

  expectError(Stack().pop(10));
}

{
  // #shift

  // $ExpectType Stack<number>
  Stack<number>().shift();

  expectError(Stack().shift(10));
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

  expectError(
    Stack<number>().map<string>(
      (value: number, key: number, iter: Stack<number>) => 1
    )
  );

  expectError(
    Stack<number>().map<number>(
      (value: string, key: number, iter: Stack<number>) => 1
    )
  );

  expectError(
    Stack<number>().map<number>(
      (value: number, key: string, iter: Stack<number>) => 1
    )
  );

  expectError(
    Stack<number>().map<number>(
      (value: number, key: number, iter: Stack<string>) => 1
    )
  );

  expectError(
    Stack<number>().map<number>(
      (value: number, key: number, iter: Stack<number>) => 'a'
    )
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

  expectError(
    Stack<number>().flatMap<string>(
      (value: number, key: number, iter: Stack<number>) => 1
    )
  );

  expectError(
    Stack<number>().flatMap<number>(
      (value: string, key: number, iter: Stack<number>) => 1
    )
  );

  expectError(
    Stack<number>().flatMap<number>(
      (value: number, key: string, iter: Stack<number>) => 1
    )
  );

  expectError(
    Stack<number>().flatMap<number>(
      (value: number, key: number, iter: Stack<string>) => 1
    )
  );

  expectError(
    Stack<number>().flatMap<number>(
      (value: number, key: number, iter: Stack<number>) => 'a'
    )
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

  expectError(Stack<number>().flatten('a'));
}

{
  // #withMutations

  // $ExpectType Stack<number>
  Stack<number>().withMutations(mutable => mutable);

  expectError(
    Stack<number>().withMutations((mutable: Stack<string>) => mutable)
  );
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
