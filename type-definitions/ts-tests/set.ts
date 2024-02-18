import { expectError, expectNotAssignable } from 'tsd';
import { Set, Map, Collection } from 'immutable';

{
  // #constructor

  // $ExpectType Set<unknown>
  Set();

  const numberSet: Set<number> = Set<number>();
  const numberOrStringSet: Set<number | string> = Set([1, 'a']);

  // Invalid number set
  expectNotAssignable<Set<number>>(Set([1, 'a']));
}

{
  // #size

  // $ExpectType number
  Set().size;

  expectError((Set().size = 10));
}

{
  // .of

  // $ExpectType Set<number>
  Set.of(1, 2, 3);

  expectError(Set.of<number>('a', 1));

  // $ExpectType Set<string | number>
  Set.of<number | string>('a', 1);
}

{
  // .fromKeys

  // $ExpectType Set<number>
  Set.fromKeys(Map<number, string>());

  // $ExpectType Set<number>
  Set.fromKeys<number>(Map<number, string>());

  // $ExpectType Set<string>
  Set.fromKeys({ a: 1 });

  expectError(Set.fromKeys<number>(Map<string, string>()));

  // $ExpectType Set<string | number>
  Set.fromKeys<number | string>(Map<number | string, string>());
}

{
  // #get

  // $ExpectType number | undefined
  Set<number>().get(4);

  // $ExpectType number | "a"
  Set<number>().get(4, 'a');

  expectError(Set<number>().get<number>(4, 'a'));
}

{
  // #delete

  // $ExpectType Set<number>
  Set<number>().delete(0);

  expectError(Set<number>().delete('a'));
}
{
  // #remove

  // $ExpectType Set<number>
  Set<number>().remove(0);

  expectError(Set<number>().remove('a'));
}

{
  // #clear

  // $ExpectType Set<number>
  Set<number>().clear();

  expectError(Set().clear(10));
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

  expectError(Set<number>().intersect(Set<string>()));

  // $ExpectType Set<string | number>
  Set<number | string>().intersect(Set<string>());

  // $ExpectType Set<string | number>
  Set<number | string>().intersect(Set<number>());
}

{
  // #subtract

  // $ExpectType Set<number>
  Set<number>().subtract(Set<number>());

  expectError(Set<number>().subtract(Set<string>()));

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

  expectError(Set<number>().flatten('a'));
}

{
  // #withMutations

  // $ExpectType Set<number>
  Set<number>().withMutations(mutable => mutable);

  expectError(Set<number>().withMutations((mutable: Set<string>) => mutable));
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

{
  // #toJS / #toJJSON

  // $ExpectType number[][]
  Set<Set<number>>().toJS();

  // $ExpectType Set<number>[]
  Set<Set<number>>().toJSON();
}
