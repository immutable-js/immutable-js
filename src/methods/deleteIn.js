import { removeIn } from '../functional/removeIn';

export function deleteIn(keyPath) {
  return removeIn(this, keyPath);
}
