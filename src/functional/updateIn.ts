import { isImmutable } from '../predicates/isImmutable';
import coerceKeyPath from '../utils/coerceKeyPath';
import isDataStructure from '../utils/isDataStructure';
import quoteString from '../utils/quoteString';
import { NOT_SET } from '../TrieUtils';
import { emptyMap } from '../Map';
import { get } from './get';
import { remove } from './remove';
import { set } from './set';
import type {
  Collection,
  KeyPath,
  Record,
  RetrievePath,
} from '../../type-definitions/immutable';

/**
 * Returns a copy of the collection with the value at key path set to the
 * result of providing the existing value to the updating function.
 *
 * A functional alternative to `collection.updateIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { updateIn } from 'immutable'
 *
 * const original = { x: { y: { z: 123 }}}
 * updateIn(original, ['x', 'y', 'z'], val => val * 6) // { x: { y: { z: 738 }}}
 * console.log(original) // { x: { y: { z: 123 }}}
 * ```
 */

export type PossibleCollection<K, V, TProps extends object> =
  | Collection<K, V>
  | Record<TProps>
  | Array<V>;

type UpdaterFunction<K extends PropertyKey, C> = (
  value: RetrievePath<C, Array<K>> | undefined
) => unknown | undefined;
type UpdaterFunctionWithNSV<K extends PropertyKey, C, NSV> = (
  value: RetrievePath<C, Array<K>> | NSV
) => unknown;

export function updateIn<K extends PropertyKey, V, C extends Collection<K, V>>(
  collection: C,
  keyPath: KeyPath<K>,
  updater: UpdaterFunction<K, C>
): C;
export function updateIn<
  K extends PropertyKey,
  V,
  C extends Collection<K, V>,
  NSV,
>(
  collection: C,
  keyPath: KeyPath<K>,
  notSetValue: NSV,
  updater: UpdaterFunctionWithNSV<K, C, NSV>
): C;
export function updateIn<
  TProps extends object,
  C extends Record<TProps>,
  K extends keyof TProps,
>(record: C, keyPath: KeyPath<K>, updater: UpdaterFunction<K, C>): C;
export function updateIn<
  TProps extends object,
  C extends Record<TProps>,
  K extends keyof TProps,
  NSV,
>(
  record: C,
  keyPath: KeyPath<K>,
  notSetValue: NSV,
  updater: UpdaterFunctionWithNSV<K, C, NSV>
): C;
export function updateIn<K extends PropertyKey, V, C extends Array<V>>(
  collection: C,
  keyPath: KeyPath<string | number>,
  updater: UpdaterFunction<K, C>
): Array<V>;
export function updateIn<K extends PropertyKey, V, C extends Array<V>, NSV>(
  collection: C,
  keyPath: KeyPath<K>,
  notSetValue: NSV,
  updater: UpdaterFunctionWithNSV<K, C, NSV>
): Array<V>;
export function updateIn<K extends PropertyKey, C>(
  object: C,
  keyPath: KeyPath<K>,
  updater: UpdaterFunction<K, C>
): C;
export function updateIn<K extends PropertyKey, C, NSV>(
  object: C,
  keyPath: KeyPath<K>,
  notSetValue: NSV,
  updater: UpdaterFunctionWithNSV<K, C, NSV>
): C;
export function updateIn<
  K extends PropertyKey,
  V,
  C extends { [key: PropertyKey]: V },
>(
  collection: C,
  keyPath: KeyPath<K>,
  updater: UpdaterFunction<K, C>
): { [key: PropertyKey]: V };
export function updateIn<
  K extends PropertyKey,
  V,
  C extends { [key: PropertyKey]: V },
  NSV,
>(
  collection: C,
  keyPath: KeyPath<K>,
  notSetValue: NSV,
  updater: UpdaterFunction<K, C>
): { [key: PropertyKey]: V };

export function updateIn<
  K extends PropertyKey,
  V,
  TProps extends object,
  C extends PossibleCollection<K, V, TProps>,
  NSV,
>(
  collection: C,
  keyPath: KeyPath<K>,
  notSetValue: NSV | UpdaterFunction<K, C> | undefined,
  updater?: UpdaterFunctionWithNSV<K, C, NSV>
): C {
  if (!updater) {
    // handle the fact that `notSetValue` is optional here, in that case `updater` is the updater function
    // @ts-expect-error updater is a function here
    updater = notSetValue as UpdaterFunction<K, C>;
    notSetValue = undefined;
  }
  const updatedValue = updateInDeeply(
    isImmutable(collection),
    // @ts-expect-error type issues with Record and mixed types
    collection,
    coerceKeyPath(keyPath),
    0,
    notSetValue,
    updater
  );
  // @ts-expect-error mixed return type
  return updatedValue === NOT_SET ? notSetValue : updatedValue;
}

function updateInDeeply<
  K extends PropertyKey,
  TProps extends object,
  C extends PossibleCollection<unknown, unknown, TProps>,
  NSV,
>(
  inImmutable: boolean,
  existing: C,
  keyPath: Array<K>,
  i: number,
  notSetValue: NSV | undefined,
  updater: UpdaterFunctionWithNSV<K, C, NSV> | UpdaterFunction<K, C>
): C {
  const wasNotSet = existing === NOT_SET;
  if (i === keyPath.length) {
    const existingValue = wasNotSet ? notSetValue : existing;
    // @ts-expect-error mixed type with optional value
    const newValue = updater(existingValue);
    // @ts-expect-error mixed type
    return newValue === existingValue ? existing : newValue;
  }
  if (!wasNotSet && !isDataStructure(existing)) {
    throw new TypeError(
      'Cannot update within non-data-structure value in path [' +
        Array.from(keyPath).slice(0, i).map(quoteString) +
        ']: ' +
        existing
    );
  }
  const key = keyPath[i];

  if (typeof key === 'undefined') {
    throw new TypeError(
      'Index can not be undefined in updateIn(). This should not happen'
    );
  }

  const nextExisting = wasNotSet ? NOT_SET : get(existing, key, NOT_SET);
  const nextUpdated = updateInDeeply(
    nextExisting === NOT_SET ? inImmutable : isImmutable(nextExisting),
    // @ts-expect-error mixed type
    nextExisting,
    keyPath,
    i + 1,
    notSetValue,
    updater
  );
  return nextUpdated === nextExisting
    ? existing
    : nextUpdated === NOT_SET
      ? remove(existing, key)
      : set(
          wasNotSet ? (inImmutable ? emptyMap() : {}) : existing,
          key,
          nextUpdated
        );
}
