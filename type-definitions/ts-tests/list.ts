import { List } from '../../';

{ // #constructor

  // $ExpectType List<any>
  List();

  const numberList: List<number> = List();
  const numberOrStringList: List<number | string> = List([1, 'a']);

  // $ExpectError
  const invalidNumberList: List<number> = List([1, 'a']);
}

{ // #size

  // $ExpectType number
  List().size;

  // $ExpectError
  List().size = 10;
}

{ // #setSize

  // $ExpectType List<number>
  List<number>().setSize(10);

  // $ExpectError
  List<number>().setSize('foo');
}

{ // .of

  // $ExpectType List<number>
  List.of(1, 2, 3);

  // $ExpectError
  List.of<number>('a', 1);

  // $ExpectType List<string | number>
  List.of<number | string>('a', 1);
}

{ // #get

  // $ExpectType number | undefined
  List<number>().get(4);

  // $ExpectType number | "a"
  List<number>().get(4, 'a');

  // $ExpectError
  List<number>().get<number>(4, 'a');
}

{ // #set

  // $ExpectType List<number>
  List<number>().set(0, 0);

  // $ExpectError
  List<number>().set(1, 'a');

  // $ExpectError
  List<number>().set('a', 1);

  // $ExpectType List<string | number>
  List<number | string>().set(0, 1);

  // $ExpectType List<string | number>
  List<number | string>().set(0, 'a');
}

{ // #setIn

  // $ExpectType List<number>
  List<number>().setIn([], 0);
}

{ // #insert

  // $ExpectType List<number>
  List<number>().insert(0, 0);

  // $ExpectError
  List<number>().insert(1, 'a');

  // $ExpectError
  List<number>().insert('a', 1);

  // $ExpectType List<string | number>
  List<number | string>().insert(0, 1);

  // $ExpectType List<string | number>
  List<number | string>().insert(0, 'a');
}

{ // #push

  // $ExpectType List<number>
  List<number>().push(0, 0);

  // $ExpectError
  List<number>().push(1, 'a');

  // $ExpectError
  List<number>().push('a', 1);

  // $ExpectType List<string | number>
  List<number | string>().push(0, 1);

  // $ExpectType List<string | number>
  List<number | string>().push(0, 'a');
}

{ // #unshift

  // $ExpectType List<number>
  List<number>().unshift(0, 0);

  // $ExpectError
  List<number>().unshift(1, 'a');

  // $ExpectError
  List<number>().unshift('a', 1);

  // $ExpectType List<string | number>
  List<number | string>().unshift(0, 1);

  // $ExpectType List<string | number>
  List<number | string>().unshift(0, 'a');
}

{ // #delete

  // $ExpectType List<number>
  List<number>().delete(0);

  // $ExpectError
  List().delete('a');
}

{ // #deleteIn

  // $ExpectType List<number>
  List<number>().deleteIn([]);
}

{ // #remove

  // $ExpectType List<number>
  List<number>().remove(0);

  // $ExpectError
  List().remove('a');
}

{ // #removeIn

  // $ExpectType List<number>
  List<number>().removeIn([]);
}

{ // #clear

  // $ExpectType List<number>
  List<number>().clear();

  // $ExpectError
  List().clear(10);
}

{ // #pop

  // $ExpectType List<number>
  List<number>().pop();

  // $ExpectError
  List().pop(10);
}

{ // #shift

  // $ExpectType List<number>
  List<number>().shift();

  // $ExpectError
  List().shift(10);
}

{ // #update

  // $ExpectType number
  List().update(v => 1);

  // $ExpectError
  List<number>().update((v: List<string>) => v);

  // $ExpectType List<number>
  List<number>().update(0, (v: number) => 0);

  // $ExpectError
  List<number>().update(0, (v: number) => v + 'a');

  // $ExpectType List<number>
  List<number>().update(1, 10, (v: number) => 0);

  // $ExpectError
  List<number>().update(1, 'a', (v: number) => 0);

  // $ExpectError
  List<number>().update(1, 10, (v: number) => v + 'a');
}

{ // #updateIn

  // $ExpectType List<number>
  List<number>().updateIn([], v => v);

  // $ExpectError
  List<number>().updateIn([], 10);
}

{ // #map

  // $ExpectType List<number>
  List<number>().map((value: number, key: number, iter: List<number>) => 1);

  // $ExpectType List<string>
  List<number>().map((value: number, key: number, iter: List<number>) => 'a');

  // $ExpectType List<number>
  List<number>().map<number>((value: number, key: number, iter: List<number>) => 1);

  // $ExpectError
  List<number>().map<string>((value: number, key: number, iter: List<number>) => 1);

  // $ExpectError
  List<number>().map<number>((value: string, key: number, iter: List<number>) => 1);

  // $ExpectError
  List<number>().map<number>((value: number, key: string, iter: List<number>) => 1);

  // $ExpectError
  List<number>().map<number>((value: number, key: number, iter: List<string>) => 1);

  // $ExpectError
  List<number>().map<number>((value: number, key: number, iter: List<number>) => 'a');
}

{ // #flatMap

  // $ExpectType List<number>
  List<number>().flatMap((value: number, key: number, iter: List<number>) => [1]);

  // $ExpectType List<string>
  List<number>().flatMap((value: number, key: number, iter: List<number>) => ['a']);

  // $ExpectType List<number>
  List<number>().flatMap<number>((value: number, key: number, iter: List<number>) => [1]);

  // $ExpectError
  List<number>().flatMap<string>((value: number, key: number, iter: List<number>) => [1]);

  // $ExpectError
  List<number>().flatMap<number>((value: string, key: number, iter: List<number>) => [1]);

  // $ExpectError
  List<number>().flatMap<number>((value: number, key: string, iter: List<number>) => [1]);

  // $ExpectError
  List<number>().flatMap<number>((value: number, key: number, iter: List<string>) => [1]);

  // $ExpectError
  List<number>().flatMap<number>((value: number, key: number, iter: List<number>) => ['a']);
}

{ // #merge

  // $ExpectType List<number>
  List<number>().merge(List<number>());

  // $ExpectError
  List<number>().merge(List<string>());

  // $ExpectType List<string | number>
  List<number | string>().merge(List<string>());

  // $ExpectType List<string | number>
  List<number | string>().merge(List<number>());
}

{ // #mergeIn

  // $ExpectType List<number>
  List<number>().mergeIn([], []);
}

{ // #mergeWith

  // $ExpectType List<number>
  List<number>().mergeWith((prev: number, next: number, key: number) => 1, List<number>());

  // $ExpectError
  List<number>().mergeWith((prev: string, next: number, key: number) => 1, List<number>());

  // $ExpectError
  List<number>().mergeWith((prev: number, next: string, key: number) => 1, List<number>());

  // $ExpectError
  List<number>().mergeWith((prev: number, next: number, key: string) => 1, List<number>());

  // $ExpectError
  List<number>().mergeWith((prev: number, next: number, key: number) => 'a', List<number>());

  // $ExpectError
  List<number>().mergeWith((prev: number, next: number, key: number) => 1, List<string>());

  // $ExpectType List<string | number>
  List<number | string>().mergeWith((prev: number, next: string, key: number) => 1, List<string>());
}

{ // #mergeDeep

  // $ExpectType List<number>
  List<number>().mergeDeep(List<number>());

  // $ExpectError
  List<number>().mergeDeep(List<string>());

  // $ExpectType List<string | number>
  List<number | string>().mergeDeep(List<string>());

  // $ExpectType List<string | number>
  List<number | string>().mergeDeep(List<number>());
}

{ // #mergeDeepIn

  // $ExpectType List<number>
  List<number>().mergeDeepIn([], []);
}

{ // #mergeDeepWith

  // $ExpectType List<number>
  List<number>().mergeDeepWith((prev: number, next: number, key: number) => 1, List<number>());

  // $ExpectError
  List<number>().mergeDeepWith((prev: string, next: number, key: number) => 1, List<number>());

  // $ExpectError
  List<number>().mergeDeepWith((prev: number, next: string, key: number) => 1, List<number>());

  // $ExpectError
  List<number>().mergeDeepWith((prev: number, next: number, key: string) => 1, List<number>());

  // $ExpectError
  List<number>().mergeDeepWith((prev: number, next: number, key: number) => 'a', List<number>());

  // $ExpectError
  List<number>().mergeDeepWith((prev: number, next: number, key: number) => 1, List<string>());

  // $ExpectType List<string | number>
  List<number | string>().mergeDeepWith((prev: number, next: string, key: number) => 1, List<string>());
}

{ // #flatten

  // $ExpectType Collection<any, any>
  List<number>().flatten();

  // $ExpectType Collection<any, any>
  List<number>().flatten(10);

  // $ExpectType Collection<any, any>
  List<number>().flatten(false);

  // $ExpectError
  List<number>().flatten('a');
}

{ // #withMutations

  // $ExpectType List<number>
  List<number>().withMutations(mutable => mutable);

  // $ExpectError
  List<number>().withMutations((mutable: List<string>) => mutable);
}

{ // #asMutable

  // $ExpectType List<number>
  List<number>().asMutable();
}

{ // #asImmutable

  // $ExpectType List<number>
  List<number>().asImmutable();
}
