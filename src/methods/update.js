import { update as _update } from '../functional/update';

export function update(key, notSetValue, updater) {
  return arguments.length === 1
    ? key(this)
    : _update(this, key, notSetValue, updater);
}
