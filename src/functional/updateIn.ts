import { isImmutable } from '../predicates/isImmutable';
import coerceKeyPath, { type KeyPath } from '../utils/coerceKeyPath';
import isDataStructure from '../utils/isDataStructure';
import quoteString from '../utils/quoteString';
import { NOT_SET } from '../TrieUtils';
import { emptyMap } from '../Map';
import { get } from './get';
import { remove } from './remove';
import { set } from './set';
import type { Collection } from '../../type-definitions/immutable';

type UpdaterFunction = (value: unknown) => unknown;

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
export function updateIn<K, V, C extends Collection<K, V>>(
  collection: C,
  keyPath: KeyPath<K>,
  updater: UpdaterFunction
): C;
export function updateIn<K, V, C extends Collection<K, V>>(
  collection: Collection<K, V>,
  keyPath: KeyPath<unknown>,
  notSetValue: V,
  updater: UpdaterFunction
): C;
export function updateIn<K, V, C extends Collection<K, V>>(
  collection: C,
  keyPath: KeyPath<K>,
  notSetValue: V | UpdaterFunction,
  updater?: UpdaterFunction
): C {
  if (!updater) {
    // handle the fact that `notSetValue` is optional here, in that case `updater` is the updater function
    updater = notSetValue as UpdaterFunction;
    // @ts-expect-error notSetValue mixed type
    notSetValue = undefined;
  }
  const updatedValue = updateInDeeply(
    isImmutable(collection),
    collection,
    coerceKeyPath(keyPath),
    0,
    notSetValue,
    updater
  );
  // @ts-expect-error mixed return type
  return updatedValue === NOT_SET ? notSetValue : updatedValue;
}

function updateInDeeply<K, V, C extends Collection<K, V>>(
  inImmutable: boolean,
  existing: C,
  keyPath: ArrayLike<K>,
  i: number,
  notSetValue: V,
  updater: UpdaterFunction
): C {
  const wasNotSet = existing === NOT_SET;
  if (i === keyPath.length) {
    const existingValue = wasNotSet ? notSetValue : existing;
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
