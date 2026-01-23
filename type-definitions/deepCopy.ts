import type { CollectionImpl, KeyedCollectionImpl } from '../src/Collection';
import type { MapOf, Record } from './immutable';

type OnlyObject<T> = Extract<T, object>;

type ContainObject<T> =
  OnlyObject<T> extends object
    ? OnlyObject<T> extends never
      ? false
      : true
    : false;

/**
 * Used to convert deeply all immutable types to a plain TS type.
 * Using `unknown` on object instead of recursive call as we have a circular reference issue
 */
export type DeepCopy<T> =
  T extends Record<infer R>
    ? // convert Record to DeepCopy plain JS object
      {
        [key in keyof R]: ContainObject<R[key]> extends true ? unknown : R[key];
      }
    : T extends MapOf<infer R>
      ? // convert MapOf to DeepCopy plain JS object
        {
          [key in keyof R]: ContainObject<R[key]> extends true
            ? unknown
            : R[key];
        }
      : T extends KeyedCollectionImpl<infer KeyedKey, infer V>
        ? // convert KeyedCollection to DeepCopy plain JS object
          {
            [key in KeyedKey extends PropertyKey
              ? KeyedKey
              : string]: V extends object ? unknown : V;
          }
        : // convert IndexedCollection or Immutable.Set to DeepCopy plain JS array
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          T extends CollectionImpl<infer _, infer V>
          ? Array<DeepCopy<V>>
          : T extends string | number // Iterable scalar types : should be kept as is
            ? T
            : T extends Iterable<infer V> // Iterable are converted to plain JS array
              ? Array<DeepCopy<V>>
              : T extends object // plain JS object are converted deeply
                ? {
                    [ObjectKey in keyof T]: ContainObject<
                      T[ObjectKey]
                    > extends true
                      ? unknown
                      : T[ObjectKey];
                  }
                : // other case : should be kept as is
                  T;
