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
  return !!(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
}

export function isKeyed(maybeKeyed) {
  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SYMBOL]);
}

export function isIndexed(maybeIndexed) {
  return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SYMBOL]);
}

export function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}

export function isOrdered(maybeOrdered) {
  return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SYMBOL]);
}

export function isRecord(maybeRecord) {
  return !!(maybeRecord && maybeRecord[IS_RECORD_SYMBOL]);
}

export function isValueObject(maybeValue) {
  return !!(
    maybeValue &&
    typeof maybeValue.equals === 'function' &&
    typeof maybeValue.hashCode === 'function'
  );
}

// Note: values unchanged to preserve immutable-devtools.
export const IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';
export const IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';
export const IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';
export const IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';
export const IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';
