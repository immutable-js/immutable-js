import { updateIn as _updateIn } from '../functional/updateIn';

export function updateIn(keyPath, notSetValue, updater) {
  return _updateIn(this, keyPath, notSetValue, updater);
}
