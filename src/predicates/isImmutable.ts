import type { Collection, Record } from '../../type-definitions/immutable';
import { isCollection } from './isCollection';
import { isRecord } from './isRecord';

export function isImmutable(
  maybeImmutable: unknown
): maybeImmutable is Collection<unknown, unknown> | Record<object> {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}
