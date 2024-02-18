import { expectType, expectError, expectNotAssignable } from 'tsd';
import { OrderedSet, Map, Collection } from 'immutable';

{
  // #constructor

  expectType<OrderedSet<unknown>>(OrderedSet());

  const numberOrderedSet: OrderedSet<number> = OrderedSet<number>();
  const numberOrStringOrderedSet: OrderedSet<number | string> = OrderedSet([
    1,
    'a',
  ]);

  // Invalid number ordered set
  expectNotAssignable<OrderedSet<number>>(OrderedSet([1, 'a']));
}

{
  // #size

  expectType<number>(OrderedSet().size);

  expectError((OrderedSet().size = 10));
}

{
  // .of

  expectType<OrderedSet<number>>(OrderedSet.of(1, 2, 3));

  expectError(OrderedSet.of<number>('a', 1));

  expectType<OrderedSet<string | number>>(
    OrderedSet.of<number | string>('a', 1)
  );
}

{
  // .fromKeys

  expectType<OrderedSet<number>>(OrderedSet.fromKeys(Map<number, string>()));

  expectType<OrderedSet<number>>(
    OrderedSet.fromKeys<number>(Map<number, string>())
  );

  expectType<OrderedSet<string>>(OrderedSet.fromKeys({ a: 1 }));

  expectError(OrderedSet.fromKeys<number>(Map<string, string>()));

  expectType<OrderedSet<string | number>>(
    OrderedSet.fromKeys<number | string>(Map<number | string, string>())
  );
}

{
  // #get

  expectType<number | undefined>(OrderedSet<number>().get(4));

  expectType<number | 'a'>(OrderedSet<number>().get(4, 'a'));

  expectError(OrderedSet<number>().get<number>(4, 'a'));
}

{
  // #delete

  expectType<OrderedSet<number>>(OrderedSet<number>().delete(0));

  expectError(OrderedSet<number>().delete('a'));
}
{
  // #remove

  expectType<OrderedSet<number>>(OrderedSet<number>().remove(0));

  expectError(OrderedSet<number>().remove('a'));
}

{
  // #clear

  expectType<OrderedSet<number>>(OrderedSet<number>().clear());

  expectError(OrderedSet().clear(10));
}

{
  // #map

  expectType<OrderedSet<number>>(
    OrderedSet<number>().map(
      (value: number, key: number, iter: OrderedSet<number>) => 1
    )
  );

  expectType<OrderedSet<string>>(
    OrderedSet<number>().map(
      (value: number, key: number, iter: OrderedSet<number>) => 'a'
    )
  );

  expectType<OrderedSet<number>>(
    OrderedSet<number>().map<number>(
      (value: number, key: number, iter: OrderedSet<number>) => 1
    )
  );

  expectError(
    OrderedSet<number>().map<string>(
      (value: number, key: number, iter: OrderedSet<number>) => 1
    )
  );

  expectError(
    OrderedSet<number>().map<number>(
      (value: string, key: number, iter: OrderedSet<number>) => 1
    )
  );

  expectError(
    OrderedSet<number>().map<number>(
      (value: number, key: string, iter: OrderedSet<number>) => 1
    )
  );

  expectError(
    OrderedSet<number>().map<number>(
      (value: number, key: number, iter: OrderedSet<string>) => 1
    )
  );

  expectError(
    OrderedSet<number>().map<number>(
      (value: number, key: number, iter: OrderedSet<number>) => 'a'
    )
  );
}

{
  // #flatMap

  expectType<OrderedSet<number>>(
    OrderedSet<number>().flatMap(
      (value: number, key: number, iter: OrderedSet<number>) => [1]
    )
  );

  expectType<OrderedSet<string>>(
    OrderedSet<number>().flatMap(
      (value: number, key: number, iter: OrderedSet<number>) => ['a']
    )
  );

  expectType<OrderedSet<number>>(
    OrderedSet<number>().flatMap<number>(
      (value: number, key: number, iter: OrderedSet<number>) => [1]
    )
  );

  expectError(
    OrderedSet<number>().flatMap<string>(
      (value: number, key: number, iter: OrderedSet<number>) => [1]
    )
  );

  expectError(
    OrderedSet<number>().flatMap<number>(
      (value: string, key: number, iter: OrderedSet<number>) => [1]
    )
  );

  expectError(
    OrderedSet<number>().flatMap<number>(
      (value: number, key: string, iter: OrderedSet<number>) => [1]
    )
  );

  expectError(
    OrderedSet<number>().flatMap<number>(
      (value: number, key: number, iter: OrderedSet<string>) => [1]
    )
  );

  expectError(
    OrderedSet<number>().flatMap<number>(
      (value: number, key: number, iter: OrderedSet<number>) => ['a']
    )
  );
}

{
  // #union

  expectType<OrderedSet<number>>(
    OrderedSet<number>().union(OrderedSet<number>())
  );

  expectType<OrderedSet<string | number>>(
    OrderedSet<number>().union(OrderedSet<string>())
  );

  expectType<OrderedSet<string | number>>(
    OrderedSet<number | string>().union(OrderedSet<string>())
  );

  expectType<OrderedSet<string | number>>(
    OrderedSet<number | string>().union(OrderedSet<number>())
  );
}

{
  // #merge

  expectType<OrderedSet<number>>(
    OrderedSet<number>().merge(OrderedSet<number>())
  );

  expectType<OrderedSet<string | number>>(
    OrderedSet<number>().merge(OrderedSet<string>())
  );

  expectType<OrderedSet<string | number>>(
    OrderedSet<number | string>().merge(OrderedSet<string>())
  );

  expectType<OrderedSet<string | number>>(
    OrderedSet<number | string>().merge(OrderedSet<number>())
  );
}

{
  // #intersect

  expectType<OrderedSet<number>>(
    OrderedSet<number>().intersect(OrderedSet<number>())
  );

  expectError(OrderedSet<number>().intersect(OrderedSet<string>()));

  expectType<OrderedSet<string | number>>(
    OrderedSet<number | string>().intersect(OrderedSet<string>())
  );

  expectType<OrderedSet<string | number>>(
    OrderedSet<number | string>().intersect(OrderedSet<number>())
  );
}

{
  // #subtract

  expectType<OrderedSet<number>>(
    OrderedSet<number>().subtract(OrderedSet<number>())
  );

  expectError(OrderedSet<number>().subtract(OrderedSet<string>()));

  expectType<OrderedSet<string | number>>(
    OrderedSet<number | string>().subtract(OrderedSet<string>())
  );

  expectType<OrderedSet<string | number>>(
    OrderedSet<number | string>().subtract(OrderedSet<number>())
  );
}

{
  // #flatten

  expectType<Collection<unknown, unknown>>(OrderedSet<number>().flatten());

  expectType<Collection<unknown, unknown>>(OrderedSet<number>().flatten(10));

  expectType<Collection<unknown, unknown>>(OrderedSet<number>().flatten(false));

  expectError(OrderedSet<number>().flatten('a'));
}

{
  // #withMutations

  expectType<OrderedSet<number>>(
    OrderedSet<number>().withMutations(mutable => mutable)
  );

  expectError(
    OrderedSet<number>().withMutations((mutable: OrderedSet<string>) => mutable)
  );
}

{
  // #asMutable

  expectType<OrderedSet<number>>(OrderedSet<number>().asMutable());
}

{
  // #asImmutable

  expectType<OrderedSet<number>>(OrderedSet<number>().asImmutable());
}
