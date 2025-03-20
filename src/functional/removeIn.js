import { updateIn } from './updateIn';

export function removeIn(collection, keyPath) {
  return updateIn(collection, keyPath, () => undefined);
}
