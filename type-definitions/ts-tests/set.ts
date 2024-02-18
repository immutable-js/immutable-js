import { expectType, expectError, expectNotAssignable } from 'tsd';
import { Set, Map, Collection } from 'immutable';

{
  // #constructor

  expectType<Set<unknown>>(Set());

  const numberSet: Set<number> = Set<number>();
  const numberOrStringSet: Set<number | string> = Set([1, 'a']);

  // Invalid number set
  expectNotAssignable<Set<number>>(Set([1, 'a']));
}

{
  // #size

  expectType<number>(Set().size);

  expectError((Set().size = 10));
}

{
  // .of

  expectType<Set<number>>(Set.of(1, 2, 3));

  expectError(Set.of<number>('a', 1));

  expectType<Set<string | number>>(Set.of<number | string>('a', 1));
}

{
  // .fromKeys

  expectType<Set<number>>(Set.fromKeys(Map<number, string>()));

  expectType<Set<number>>(Set.fromKeys<number>(Map<number, string>()));

  expectType<Set<string>>(Set.fromKeys({ a: 1 }));

  expectError(Set.fromKeys<number>(Map<string, string>()));

  expectType<Set<string | number>>(
    Set.fromKeys<number | string>(Map<number | string, string>())
  );
}

{
  // #get

  expectType<number | undefined>(Set<number>().get(4));

  expectType<number | 'a'>(Set<number>().get(4, 'a'));

  expectError(Set<number>().get<number>(4, 'a'));
}

{
  // #delete

  expectType<Set<number>>(Set<number>().delete(0));

  expectError(Set<number>().delete('a'));
}
{
  // #remove

  expectType<Set<number>>(Set<number>().remove(0));

  expectError(Set<number>().remove('a'));
}

{
  // #clear

  expectType<Set<number>>(Set<number>().clear());

  expectError(Set().clear(10));
}

{
  // #map

  expectType<Set<number>>(
    Set<number>().map((value: number, key: number, iter: Set<number>) => 1)
  );

  expectType<Set<string>>(
    Set<number>().map((value: number, key: number, iter: Set<number>) => 'a')
  );

  expectType<Set<number>>(
    Set<number>().map<number>(
      (value: number, key: number, iter: Set<number>) => 1
    )
  );

  expectError(
    Set<number>().map<string>(
      (value: number, key: number, iter: Set<number>) => 1
    )
  );

  expectError(
    Set<number>().map<number>(
      (value: string, key: number, iter: Set<number>) => 1
    )
  );

  expectError(
    Set<number>().map<number>(
      (value: number, key: string, iter: Set<number>) => 1
    )
  );

  expectError(
    Set<number>().map<number>(
      (value: number, key: number, iter: Set<string>) => 1
    )
  );

  expectError(
    Set<number>().map<number>(
      (value: number, key: number, iter: Set<number>) => 'a'
    )
  );
}

{
  // #flatMap

  expectType<Set<number>>(
    Set<number>().flatMap((value: number, key: number, iter: Set<number>) => [
      1,
    ])
  );

  expectType<Set<string>>(
    Set<number>().flatMap((value: number, key: number, iter: Set<number>) => [
      'a',
    ])
  );

  expectType<Set<number>>(
    Set<number>().flatMap<number>(
      (value: number, key: number, iter: Set<number>) => [1]
    )
  );

  expectError(
    Set<number>().flatMap<string>(
      (value: number, key: number, iter: Set<number>) => [1]
    )
  );

  expectError(
    Set<number>().flatMap<number>(
      (value: string, key: number, iter: Set<number>) => [1]
    )
  );

  expectError(
    Set<number>().flatMap<number>(
      (value: number, key: string, iter: Set<number>) => [1]
    )
  );

  expectError(
    Set<number>().flatMap<number>(
      (value: number, key: number, iter: Set<string>) => [1]
    )
  );

  expectError(
    Set<number>().flatMap<number>(
      (value: number, key: number, iter: Set<number>) => ['a']
    )
  );
}

{
  // #union

  expectType<Set<number>>(Set<number>().union(Set<number>()));

  expectType<Set<string | number>>(Set<number>().union(Set<string>()));

  expectType<Set<string | number>>(Set<number | string>().union(Set<string>()));

  expectType<Set<string | number>>(Set<number | string>().union(Set<number>()));
}

{
  // #merge

  expectType<Set<number>>(Set<number>().merge(Set<number>()));

  expectType<Set<string | number>>(Set<number>().merge(Set<string>()));

  expectType<Set<string | number>>(Set<number | string>().merge(Set<string>()));

  expectType<Set<string | number>>(Set<number | string>().merge(Set<number>()));
}

{
  // #intersect

  expectType<Set<number>>(Set<number>().intersect(Set<number>()));

  expectError(Set<number>().intersect(Set<string>()));

  expectType<Set<string | number>>(
    Set<number | string>().intersect(Set<string>())
  );

  expectType<Set<string | number>>(
    Set<number | string>().intersect(Set<number>())
  );
}

{
  // #subtract

  expectType<Set<number>>(Set<number>().subtract(Set<number>()));

  expectError(Set<number>().subtract(Set<string>()));

  expectType<Set<string | number>>(
    Set<number | string>().subtract(Set<string>())
  );

  expectType<Set<string | number>>(
    Set<number | string>().subtract(Set<number>())
  );
}

{
  // #flatten

  expectType<Collection<unknown, unknown>>(Set<number>().flatten());

  expectType<Collection<unknown, unknown>>(Set<number>().flatten(10));

  expectType<Collection<unknown, unknown>>(Set<number>().flatten(false));

  expectError(Set<number>().flatten('a'));
}

{
  // #withMutations

  expectType<Set<number>>(Set<number>().withMutations(mutable => mutable));

  expectError(Set<number>().withMutations((mutable: Set<string>) => mutable));
}

{
  // #asMutable

  expectType<Set<number>>(Set<number>().asMutable());
}

{
  // #asImmutable

  expectType<Set<number>>(Set<number>().asImmutable());
}

{
  // #toJS / #toJJSON

  expectType<number[][]>(Set<Set<number>>().toJS());

  expectType<Set<number>[]>(Set<Set<number>>().toJSON());
}
