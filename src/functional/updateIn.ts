import { isImmutable } from '../predicates/isImmutable';
import coerceKeyPath from '../utils/coerceKeyPath';
import isDataStructure from '../utils/isDataStructure';
import quoteString from '../utils/quoteString';
import { NOT_SET } from '../TrieUtils';
import { emptyMap } from '../Map';
import { get } from './get';
import { remove } from './remove';
import { set } from './set';
import type { KeyPath, update } from '../../type-definitions/immutable';

type UpdaterFunction = (value: unknown) => unknown;

type UpdateTypeParameters = Parameters<typeof update>;

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
export function updateIn<C extends UpdateTypeParameters[0]>(
  collection: C,
  keyPath: KeyPath<UpdateTypeParameters[1]>,
  updater: UpdateTypeParameters[2]
): C;
export function updateIn<C extends UpdateTypeParameters[0]>(
  collection: C,
  keyPath: KeyPath<UpdateTypeParameters[1]>,
  notSetValue: UpdateTypeParameters[2],
  updater: UpdateTypeParameters[3]
): C;
export function updateIn<C extends UpdateTypeParameters[0]>(
  collection: C,
  keyPath: KeyPath<UpdateTypeParameters[1]>,
  notSetValue: UpdateTypeParameters[2],
  updater?: UpdateTypeParameters[3]
): C {
  if (!updater) {
    // handle the fact that `notSetValue` is optional here, in that case `updater` is the updater function
    updater = notSetValue as UpdaterFunction;
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

function updateInDeeply<C extends UpdateTypeParameters[0]>(
  inImmutable: boolean,
  existing: C,
  keyPath: ArrayLike<UpdateTypeParameters[1]>,
  i: number,
  notSetValue: UpdateTypeParameters[2],
  updater: UpdateTypeParameters[3]
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
