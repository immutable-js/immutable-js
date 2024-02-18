import { expectType, expectError, expectNotAssignable } from 'tsd';
import { Stack, Collection } from 'immutable';

{
  // #constructor

  expectType<Stack<unknown>>(Stack());

  const numberStack: Stack<number> = Stack<number>();
  const numberOrStringStack: Stack<number | string> = Stack([1, 'a']);

  // Invalid number stack
  expectNotAssignable<Stack<number>>(Stack([1, 'a']));
}

{
  // #size

  expectType<number>(Stack().size);

  expectError((Stack().size = 10));
}

{
  // .of

  expectType<Stack<number>>(Stack.of(1, 2, 3));

  expectError(Stack.of<number>('a', 1));

  expectType<Stack<string | number>>(Stack.of<number | string>('a', 1));
}

{
  // #peek

  expectType<number | undefined>(Stack<number>().peek());
}

{
  // #push

  expectType<Stack<number>>(Stack<number>().push(0));

  expectError(Stack<number>().push('a'));

  expectType<Stack<string | number>>(Stack<number | string>().push(0));

  expectType<Stack<string | number>>(Stack<number | string>().push('a'));
}

{
  // #pushAll

  expectType<Stack<number>>(Stack<number>().pushAll([0]));

  expectError(Stack<number>().pushAll(['a']));

  expectType<Stack<string | number>>(Stack<number | string>().pushAll([0]));

  expectType<Stack<string | number>>(Stack<number | string>().pushAll(['a']));
}

{
  // #unshift

  expectType<Stack<number>>(Stack<number>().unshift(0));

  expectError(Stack<number>().unshift('a'));

  expectType<Stack<string | number>>(Stack<number | string>().unshift(0));

  expectType<Stack<string | number>>(Stack<number | string>().unshift('a'));
}

{
  // #unshiftAll

  expectType<Stack<number>>(Stack<number>().unshiftAll([0]));

  expectError(Stack<number>().unshiftAll(['a']));

  expectType<Stack<string | number>>(Stack<number | string>().unshiftAll([1]));

  expectType<Stack<string | number>>(
    Stack<number | string>().unshiftAll(['a'])
  );
}

{
  // #clear

  expectType<Stack<number>>(Stack<number>().clear());

  expectError(Stack().clear(10));
}

{
  // #pop

  expectType<Stack<number>>(Stack<number>().pop());

  expectError(Stack().pop(10));
}

{
  // #shift

  expectType<Stack<number>>(Stack<number>().shift());

  expectError(Stack().shift(10));
}

{
  // #map

  expectType<Stack<number>>(
    Stack<number>().map((value: number, key: number, iter: Stack<number>) => 1)
  );

  expectType<Stack<string>>(
    Stack<number>().map(
      (value: number, key: number, iter: Stack<number>) => 'a'
    )
  );

  expectType<Stack<number>>(
    Stack<number>().map<number>(
      (value: number, key: number, iter: Stack<number>) => 1
    )
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

  expectType<Stack<number>>(
    Stack<number>().flatMap(
      (value: number, key: number, iter: Stack<number>) => [1]
    )
  );

  expectType<Stack<string>>(
    Stack<number>().flatMap(
      (value: number, key: number, iter: Stack<number>) => 'a'
    )
  );

  expectType<Stack<number>>(
    Stack<number>().flatMap<number>(
      (value: number, key: number, iter: Stack<number>) => [1]
    )
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

  expectType<Collection<unknown, unknown>>(Stack<number>().flatten());

  expectType<Collection<unknown, unknown>>(Stack<number>().flatten(10));

  expectType<Collection<unknown, unknown>>(Stack<number>().flatten(false));

  expectError(Stack<number>().flatten('a'));
}

{
  // #withMutations

  expectType<Stack<number>>(Stack<number>().withMutations(mutable => mutable));

  expectError(
    Stack<number>().withMutations((mutable: Stack<string>) => mutable)
  );
}

{
  // #asMutable

  expectType<Stack<number>>(Stack<number>().asMutable());
}

{
  // #asImmutable

  expectType<Stack<number>>(Stack<number>().asImmutable());
}
