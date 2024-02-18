import { expectType, expectError, expectNotAssignable } from 'tsd';
import {
  List,
  Collection,
  get,
  has,
  set,
  remove,
  update,
  setIn,
  removeIn,
  updateIn,
  merge,
} from 'immutable';

{
  // #constructor

  expectType<List<unknown>>(List());

  const numberList: List<number> = List<number>();
  const numberOrStringList: List<number | string> = List([1, 'a']);

  // Invalid number list
  expectNotAssignable<List<number>>(List([1, 'a']));
}

{
  // #size

  expectType<number>(List().size);

  expectError((List().size = 10));
}

{
  // #setSize

  expectType<List<number>>(List<number>().setSize(10));

  expectError(List<number>().setSize('foo'));
}

{
  // .of

  expectType<List<number>>(List.of(1, 2, 3));

  expectError(List.of<number>('a', 1));

  expectType<List<string | number>>(List.of<number | string>('a', 1));
}

{
  // #get

  expectType<number | undefined>(List<number>().get(4));

  expectType<number | 'a'>(List<number>().get(4, 'a'));

  expectError(List<number>().get<number>(4, 'a'));

  expectType<number | undefined>(get(List<number>(), 4));

  expectType<number | 'a'>(get(List<number>(), 4, 'a'));
}

{
  // #set

  expectType<List<number>>(List<number>().set(0, 0));

  expectError(List<number>().set(1, 'a'));

  expectError(List<number>().set('a', 1));

  expectType<List<string | number>>(List<number | string>().set(0, 1));

  expectType<List<string | number>>(List<number | string>().set(0, 'a'));

  expectType<List<number>>(set(List<number>(), 0, 0));

  expectError(set(List<number>(), 1, 'a'));

  expectError(set(List<number>(), 'a', 1));
}

{
  // #setIn

  expectType<List<number>>(List<number>().setIn([], 0));

  expectType<List<number>>(setIn(List<number>(), [], 0));
}

{
  // #insert

  expectType<List<number>>(List<number>().insert(0, 0));

  expectError(List<number>().insert(1, 'a'));

  expectError(List<number>().insert('a', 1));

  expectType<List<string | number>>(List<number | string>().insert(0, 1));

  expectType<List<string | number>>(List<number | string>().insert(0, 'a'));
}

{
  // #push

  expectType<List<number>>(List<number>().push(0, 0));

  expectError(List<number>().push(1, 'a'));

  expectError(List<number>().push('a', 1));

  expectType<List<string | number>>(List<number | string>().push(0, 1));

  expectType<List<string | number>>(List<number | string>().push(0, 'a'));
}

{
  // #unshift

  expectType<List<number>>(List<number>().unshift(0, 0));

  expectError(List<number>().unshift(1, 'a'));

  expectError(List<number>().unshift('a', 1));

  expectType<List<string | number>>(List<number | string>().unshift(0, 1));

  expectType<List<string | number>>(List<number | string>().unshift(0, 'a'));
}

{
  // #delete

  expectType<List<number>>(List<number>().delete(0));

  expectError(List().delete('a'));
}

{
  // #deleteIn

  expectType<List<number>>(List<number>().deleteIn([]));
}

{
  // #remove

  expectType<List<number>>(List<number>().remove(0));

  expectError(List().remove('a'));

  expectType<List<number>>(remove(List<number>(), 0));
}

{
  // #removeIn

  expectType<List<number>>(List<number>().removeIn([]));

  expectType<List<number>>(removeIn(List<number>(), []));
}

{
  // #clear

  expectType<List<number>>(List<number>().clear());

  expectError(List().clear(10));
}

{
  // #pop

  expectType<List<number>>(List<number>().pop());

  expectError(List().pop(10));
}

{
  // #shift

  expectType<List<number>>(List<number>().shift());

  expectError(List().shift(10));
}

{
  // #update

  expectType<number>(List().update(v => 1));

  expectError(List<number>().update((v: List<string> | undefined) => v));

  expectType<List<number>>(
    List<number>().update(0, (v: number | undefined) => 0)
  );

  expectError(List<number>().update(0, (v: number | undefined) => v + 'a'));

  expectType<List<number>>(
    List<number>().update(1, 10, (v: number | undefined) => 0)
  );

  expectError(List<number>().update(1, 'a', (v: number | undefined) => 0));

  expectError(List<number>().update(1, 10, (v: number | undefined) => v + 'a'));

  expectType<List<string>>(List<string>().update(1, v => v?.toUpperCase()));

  expectType<List<number>>(
    update(List<number>(), 0, (v: number | undefined) => 0)
  );

  expectError(update(List<number>(), 1, 10, (v: number) => v + 'a'));
}

{
  // #updateIn

  expectType<List<number>>(List<number>().updateIn([], v => v));

  expectError(List<number>().updateIn([], 10));

  expectType<List<number>>(updateIn(List<number>(), [], v => v));
}

{
  // #map

  expectType<List<number>>(
    List<number>().map((value: number, key: number, iter: List<number>) => 1)
  );

  expectType<List<string>>(
    List<number>().map((value: number, key: number, iter: List<number>) => 'a')
  );

  expectType<List<number>>(
    List<number>().map<number>(
      (value: number, key: number, iter: List<number>) => 1
    )
  );

  expectError(
    List<number>().map<string>(
      (value: number, key: number, iter: List<number>) => 1
    )
  );

  expectError(
    List<number>().map<number>(
      (value: string, key: number, iter: List<number>) => 1
    )
  );

  expectError(
    List<number>().map<number>(
      (value: number, key: string, iter: List<number>) => 1
    )
  );

  expectError(
    List<number>().map<number>(
      (value: number, key: number, iter: List<string>) => 1
    )
  );

  expectError(
    List<number>().map<number>(
      (value: number, key: number, iter: List<number>) => 'a'
    )
  );
}

{
  // #flatMap

  expectType<List<number>>(
    List<number>().flatMap((value: number, key: number, iter: List<number>) => [
      1,
    ])
  );

  expectType<List<string>>(
    List<number>().flatMap((value: number, key: number, iter: List<number>) => [
      'a',
    ])
  );

  expectType<List<string>>(List<List<string>>().flatMap(list => list));

  expectType<List<number>>(
    List<number>().flatMap<number>(
      (value: number, key: number, iter: List<number>) => [1]
    )
  );

  expectError(
    List<number>().flatMap<string>(
      (value: number, key: number, iter: List<number>) => [1]
    )
  );

  expectError(
    List<number>().flatMap<number>(
      (value: string, key: number, iter: List<number>) => [1]
    )
  );

  expectError(
    List<number>().flatMap<number>(
      (value: number, key: string, iter: List<number>) => [1]
    )
  );

  expectError(
    List<number>().flatMap<number>(
      (value: number, key: number, iter: List<string>) => [1]
    )
  );

  expectError(
    List<number>().flatMap<number>(
      (value: number, key: number, iter: List<number>) => ['a']
    )
  );
}

{
  // #merge

  expectType<List<number>>(List<number>().merge(List<number>()));

  expectType<List<string | number>>(List<number>().merge(List<string>()));

  expectType<List<string | number>>(
    List<number | string>().merge(List<string>())
  );

  expectType<List<string | number>>(
    List<number | string>().merge(List<number>())
  );

  expectType<List<number>>(merge(List<number>(), List<number>()));
}

{
  // #mergeIn

  expectType<List<number>>(List<number>().mergeIn([], []));
}

{
  // #mergeDeepIn

  expectType<List<number>>(List<number>().mergeDeepIn([], []));
}

{
  // #flatten

  expectType<Collection<unknown, unknown>>(List<number>().flatten());

  expectType<Collection<unknown, unknown>>(List<number>().flatten(10));

  expectType<Collection<unknown, unknown>>(List<number>().flatten(false));

  expectError(List<number>().flatten('a'));
}

{
  // #withMutations

  expectType<List<number>>(List<number>().withMutations(mutable => mutable));

  expectError(List<number>().withMutations((mutable: List<string>) => mutable));
}

{
  // #asMutable

  expectType<List<number>>(List<number>().asMutable());
}

{
  // #asImmutable

  expectType<List<number>>(List<number>().asImmutable());
}

{
  // #toJS / #toJSON

  expectType<number[][]>(List<List<number>>().toJS());

  expectType<List<number>[]>(List<List<number>>().toJSON());
}

{
  // # for of loops
  const list = List([1, 2, 3, 4]);
  for (const val of list) {
    const v: number = val;
  }
}
