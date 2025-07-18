import { emptyMap } from '../Map';
import { mergeDeepWithSources } from '../functional/merge';
import { updateIn } from '../functional/updateIn';

export function mergeDeepIn(keyPath, ...iters) {
  return updateIn(this, keyPath, emptyMap(), (m) =>
    mergeDeepWithSources(m, iters)
  );
}
