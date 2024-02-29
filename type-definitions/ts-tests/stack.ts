import { expect, test } from 'tstyche';
import { Collection, Stack } from 'immutable';

test('#constructor', () => {
  expect(Stack()).type.toEqual<Stack<unknown>>();

  expect(Stack<number>()).type.toEqual<Stack<number>>();

  expect(Stack([1, 'a'])).type.toEqual<Stack<number | string>>();
});

test('#size', () => {
  expect(Stack().size).type.toBeNumber();

  expect(Stack()).type.toMatch<{ readonly size: number }>();
});

test('.of', () => {
  expect(Stack.of(1, 2, 3)).type.toEqual<Stack<number>>();

  expect(Stack.of<number>('a', 1)).type.toRaiseError();

  expect(Stack.of<number | string>('a', 1)).type.toEqual<
    Stack<string | number>
  >();
});

test('#peek', () => {
  expect(Stack<number>().peek()).type.toEqual<number | undefined>();
});

test('#push', () => {
  expect(Stack<number>().push(0)).type.toEqual<Stack<number>>();

  expect(Stack<number>().push('a')).type.toRaiseError();

  expect(Stack<number | string>().push(0)).type.toEqual<
    Stack<string | number>
  >();

  expect(Stack<number | string>().push('a')).type.toEqual<
    Stack<string | number>
  >();
});

test('#pushAll', () => {
  expect(Stack<number>().pushAll([0])).type.toEqual<Stack<number>>();

  expect(Stack<number>().pushAll(['a'])).type.toRaiseError();

  expect(Stack<number | string>().pushAll([0])).type.toEqual<
    Stack<string | number>
  >();

  expect(Stack<number | string>().pushAll(['a'])).type.toEqual<
    Stack<string | number>
  >();
});

test('#unshift', () => {
  expect(Stack<number>().unshift(0)).type.toEqual<Stack<number>>();

  expect(Stack<number>().unshift('a')).type.toRaiseError();

  expect(Stack<number | string>().unshift(0)).type.toEqual<
    Stack<string | number>
  >();

  expect(Stack<number | string>().unshift('a')).type.toEqual<
    Stack<string | number>
  >();
});

test('#unshiftAll', () => {
  expect(Stack<number>().unshiftAll([0])).type.toEqual<Stack<number>>();

  expect(Stack<number>().unshiftAll(['a'])).type.toRaiseError();

  expect(Stack<number | string>().unshiftAll([1])).type.toEqual<
    Stack<string | number>
  >();

  expect(Stack<number | string>().unshiftAll(['a'])).type.toEqual<
    Stack<string | number>
  >();
});

test('#clear', () => {
  expect(Stack<number>().clear()).type.toEqual<Stack<number>>();

  expect(Stack().clear(10)).type.toRaiseError();
});

test('#pop', () => {
  expect(Stack<number>().pop()).type.toEqual<Stack<number>>();

  expect(Stack().pop(10)).type.toRaiseError();
});

test('#shift', () => {
  expect(Stack<number>().shift()).type.toEqual<Stack<number>>();

  expect(Stack().shift(10)).type.toRaiseError();
});

test('#map', () => {
  expect(
    Stack<number>().map((value: number, key: number, iter: Stack<number>) => 1)
  ).type.toEqual<Stack<number>>();

  expect(
    Stack<number>().map(
      (value: number, key: number, iter: Stack<number>) => 'a'
    )
  ).type.toEqual<Stack<string>>();

  expect(
    Stack<number>().map<number>(
      (value: number, key: number, iter: Stack<number>) => 1
    )
  ).type.toEqual<Stack<number>>();

  expect(
    Stack<number>().map<string>(
      (value: number, key: number, iter: Stack<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Stack<number>().map<number>(
      (value: string, key: number, iter: Stack<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Stack<number>().map<number>(
      (value: number, key: string, iter: Stack<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Stack<number>().map<number>(
      (value: number, key: number, iter: Stack<string>) => 1
    )
  ).type.toRaiseError();

  expect(
    Stack<number>().map<number>(
      (value: number, key: number, iter: Stack<number>) => 'a'
    )
  ).type.toRaiseError();
});

test('#flatMap', () => {
  expect(
    Stack<number>().flatMap(
      (value: number, key: number, iter: Stack<number>) => [1]
    )
  ).type.toEqual<Stack<number>>();

  expect(
    Stack<number>().flatMap(
      (value: number, key: number, iter: Stack<number>) => 'a'
    )
  ).type.toEqual<Stack<string>>();

  expect(
    Stack<number>().flatMap<number>(
      (value: number, key: number, iter: Stack<number>) => [1]
    )
  ).type.toEqual<Stack<number>>();

  expect(
    Stack<number>().flatMap<string>(
      (value: number, key: number, iter: Stack<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Stack<number>().flatMap<number>(
      (value: string, key: number, iter: Stack<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Stack<number>().flatMap<number>(
      (value: number, key: string, iter: Stack<number>) => 1
    )
  ).type.toRaiseError();

  expect(
    Stack<number>().flatMap<number>(
      (value: number, key: number, iter: Stack<string>) => 1
    )
  ).type.toRaiseError();

  expect(
    Stack<number>().flatMap<number>(
      (value: number, key: number, iter: Stack<number>) => 'a'
    )
  ).type.toRaiseError();
});

test('#flatten', () => {
  expect(Stack<number>().flatten()).type.toEqual<
    Collection<unknown, unknown>
  >();

  expect(Stack<number>().flatten(10)).type.toEqual<
    Collection<unknown, unknown>
  >();

  expect(Stack<number>().flatten(false)).type.toEqual<
    Collection<unknown, unknown>
  >();

  expect(Stack<number>().flatten('a')).type.toRaiseError();
});

test('#withMutations', () => {
  expect(Stack<number>().withMutations(mutable => mutable)).type.toEqual<
    Stack<number>
  >();

  expect(
    Stack<number>().withMutations((mutable: Stack<string>) => mutable)
  ).type.toRaiseError();
});

test('#asMutable', () => {
  expect(Stack<number>().asMutable()).type.toEqual<Stack<number>>();
});

test('#asImmutable', () => {
  expect(Stack<number>().asImmutable()).type.toEqual<Stack<number>>();
});
