import { updateIn } from './updateIn';

export function update(collection, key, notSetValue, updater) {
  return updateIn(collection, [key], notSetValue, updater);
}
