import quoteString from './utils/quoteString';

import { IS_COLLECTION_SYMBOL } from './predicates/isCollection';
import { ITERATOR_SYMBOL } from './Iterator';

export default (collectionProto) => {
  collectionProto[IS_COLLECTION_SYMBOL] = true;
  collectionProto[ITERATOR_SYMBOL] = collectionProto.values;
  collectionProto.toJSON = collectionProto.toArray;
  collectionProto.__toStringMapper = quoteString;
  collectionProto.inspect = collectionProto.toSource = function () {
    return this.toString();
  };
  collectionProto.chain = collectionProto.flatMap;
  collectionProto.contains = collectionProto.includes;

  return collectionProto;
};
