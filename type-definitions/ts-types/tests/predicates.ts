import { List } from '../../../';

declare var maybe: any;

// $ExpectError
maybe.push('3');

if (maybe instanceof List) {
  maybe.push('3');
}