import { getIn as _getIn } from '../functional/getIn';

export function getIn(searchKeyPath, notSetValue) {
  return _getIn(this, searchKeyPath, notSetValue);
}
