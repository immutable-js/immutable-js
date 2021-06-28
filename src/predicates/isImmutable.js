import { isCollection } from './isCollection';
import { isRecord } from './isRecord';

export function isImmutable(maybeImmutable) {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}
