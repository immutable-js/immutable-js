import { expectError } from 'tsd';
import { OrderedMap, List } from 'immutable';

{
  // #constructor

  // $ExpectType OrderedMap<unknown, unknown>
  OrderedMap();

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>();

  // $ExpectType OrderedMap<number, string>
  OrderedMap([[1, 'a']]);

  // $ExpectType OrderedMap<number, string>
  OrderedMap(List<[number, string]>([[1, 'a']]));

  // $ExpectType OrderedMap<string, number>
  OrderedMap({ a: 1 });

  // No longer works in typescript@>=3.9
  // // $ExpectError - TypeScript does not support Lists as tuples
  // OrderedMap(List([List(['a', 'b'])]));
}

{
  // #size

  // $ExpectType number
  OrderedMap().size;

  expectError((OrderedMap().size = 10));
}

{
  // #get

  // $ExpectType number | undefined
  OrderedMap<number, number>().get(4);

  // $ExpectType number | "a"
  OrderedMap<number, number>().get(4, 'a');

  expectError(OrderedMap<number, number>().get<number>(4, 'a'));
}

{
  // #set

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().set(0, 0);

  expectError(OrderedMap<number, number>().set(1, 'a'));

  expectError(OrderedMap<number, number>().set('a', 1));

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

  expectError(OrderedMap<number, number>().delete('a'));
}

{
  // #deleteAll

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().deleteAll([0]);

  expectError(OrderedMap<number, number>().deleteAll([0, 'a']));
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

  expectError(OrderedMap<number, number>().remove('a'));
}

{
  // #removeAll

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().removeAll([0]);

  expectError(OrderedMap<number, number>().removeAll([0, 'a']));
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

  expectError(OrderedMap().clear(10));
}

{
  // #update

  // $ExpectType number
  OrderedMap().update(v => 1);

  expectError(
    OrderedMap<number, number>().update(
      (v: OrderedMap<string> | undefined) => v
    )
  );

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().update(0, (v: number | undefined) => 0);

  expectError(
    OrderedMap<number, number>().update(0, (v: number | undefined) => v + 'a')
  );

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().update(1, 10, (v: number | undefined) => 0);

  expectError(
    OrderedMap<number, number>().update(1, 'a', (v: number | undefined) => 0)
  );

  expectError(
    OrderedMap<number, number>().update(
      1,
      10,
      (v: number | undefined) => v + 'a'
    )
  );
}

{
  // #updateIn

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().updateIn([], v => v);

  expectError(OrderedMap<number, number>().updateIn([], 10));
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

  expectError(
    OrderedMap<number, number>().map<string>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 1
    )
  );

  expectError(
    OrderedMap<number, number>().map<number>(
      (value: string, key: number, iter: OrderedMap<number, number>) => 1
    )
  );

  expectError(
    OrderedMap<number, number>().map<number>(
      (value: number, key: string, iter: OrderedMap<number, number>) => 1
    )
  );

  expectError(
    OrderedMap<number, number>().map<number>(
      (value: number, key: number, iter: OrderedMap<number, string>) => 1
    )
  );

  expectError(
    OrderedMap<number, number>().map<number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
    )
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

  expectError(
    OrderedMap<number, number>().mapKeys<string>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 1
    )
  );

  expectError(
    OrderedMap<number, number>().mapKeys<number>(
      (value: string, key: number, iter: OrderedMap<number, number>) => 1
    )
  );

  expectError(
    OrderedMap<number, number>().mapKeys<number>(
      (value: number, key: string, iter: OrderedMap<number, number>) => 1
    )
  );

  expectError(
    OrderedMap<number, number>().mapKeys<number>(
      (value: number, key: number, iter: OrderedMap<number, string>) => 1
    )
  );

  expectError(
    OrderedMap<number, number>().mapKeys<number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => 'a'
    )
  );
}

{
  // #flatMap

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().flatMap(
    (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
  );

  // $ExpectType OrderedMap<string, string>
  OrderedMap<number, number>().flatMap(
    (value: number, key: number, iter: OrderedMap<number, number>) => [
      ['a', 'b'],
    ]
  );

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().flatMap<number, number>(
    (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
  );

  expectError(
    OrderedMap<number, number>().flatMap<number, string>(
      (value: number, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
    )
  );

  expectError(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: string, key: number, iter: OrderedMap<number, number>) => [[0, 1]]
    )
  );

  expectError(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: number, key: string, iter: OrderedMap<number, number>) => [[0, 1]]
    )
  );

  expectError(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: OrderedMap<number, string>) => [[0, 1]]
    )
  );

  expectError(
    OrderedMap<number, number>().flatMap<number, number>(
      (value: number, key: number, iter: OrderedMap<number, number>) => [
        [0, 'a'],
      ]
    )
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

  expectError(
    OrderedMap<number, number>().mergeWith(
      (prev: string, next: number, key: number) => 1,
      OrderedMap<number, number>()
    )
  );

  expectError(
    OrderedMap<number, number>().mergeWith(
      (prev: number, next: string, key: number) => 1,
      OrderedMap<number, number>()
    )
  );

  expectError(
    OrderedMap<number, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      OrderedMap<number, number>()
    )
  );

  // $ExpectType OrderedMap<number, string | number>
  OrderedMap<number, number>().mergeWith(
    (prev: number, next: number, key: number) => 'a',
    OrderedMap<number, number>()
  );

  expectError(
    OrderedMap<number, number>().mergeWith(
      (prev: number, next: number, key: number) => 1,
      OrderedMap<number, string>()
    )
  );

  // $ExpectType OrderedMap<string, number>
  OrderedMap<string, number>().mergeWith(
    (prev: number, next: number, key: string) => 1,
    { a: 1 }
  );

  expectError(
    OrderedMap<string, number>().mergeWith(
      (prev: number, next: number, key: string) => 1,
      { a: 'a' }
    )
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

  // $ExpectType OrderedMap<string, number | { b: number; }>
  OrderedMap<string, number>().mergeDeep({ a: { b: 1 } });

  // $ExpectType OrderedMap<number, number>
  OrderedMap<number, number>().mergeDeep(OrderedMap<number, number>());

  // $ExpectType OrderedMap<number, string | number>
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

  expectError(
    OrderedMap<number, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      OrderedMap<number, string>()
    )
  );

  // $ExpectType OrderedMap<string, number>
  OrderedMap<string, number>().mergeDeepWith(
    (prev: unknown, next: unknown, key: unknown) => 1,
    { a: 1 }
  );

  expectError(
    OrderedMap<string, number>().mergeDeepWith(
      (prev: unknown, next: unknown, key: unknown) => 1,
      { a: 'a' }
    )
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
  OrderedMap<number, number>().withMutations(mutable => mutable);

  expectError(
    OrderedMap<number, number>().withMutations(
      (mutable: OrderedMap<string>) => mutable
    )
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
