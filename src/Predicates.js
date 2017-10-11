/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function isImmutable(maybeImmutable) {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}

export function isCollection(maybeCollection) {
  return !!(maybeCollection && maybeCollection[IS_ITERABLE_SENTINEL]);
}

export function isKeyed(maybeKeyed) {
  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
}

export function isIndexed(maybeIndexed) {
  return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
}

export function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}

export function isOrdered(maybeOrdered) {
  return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
}

export function isRecord(maybeRecord) {
  return !!(maybeRecord && maybeRecord[IS_RECORD_SENTINEL]);
}

export function isValueObject(maybeValue) {
  return !!(
    maybeValue &&
    typeof maybeValue.equals === 'function' &&
    typeof maybeValue.hashCode === 'function'
  );
}

export const IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
export const IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
export const IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
export const IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';
export const IS_RECORD_SENTINEL = '@@__IMMUTABLE_RECORD__@@';
