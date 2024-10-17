/**
 * @license
 * MIT License
 * 
 * Copyright (c) 2014-present, Lee Byron and other contributors.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
export { Seq } from './Seq.js';
export { OrderedMap } from './OrderedMap.js';
export { List } from './List.js';
export { Map } from './Map.js';
export { Stack } from './Stack.js';
export { OrderedSet } from './OrderedSet.js';
export { PairSorting } from './PairSorting.js';
export { Set } from './Set.js';
export { Record } from './Record.js';
export { Range } from './Range.js';
export { Repeat } from './Repeat.js';
export { is } from './is.js';
export { fromJS } from './fromJS.js';
export { default as isPlainObject } from './utils/isPlainObj.js';
export { isImmutable } from './predicates/isImmutable.js';
export { isCollection } from './predicates/isCollection.js';
export { isKeyed } from './predicates/isKeyed.js';
export { isIndexed } from './predicates/isIndexed.js';
export { isAssociative } from './predicates/isAssociative.js';
export { isOrdered } from './predicates/isOrdered.js';
export { isValueObject } from './predicates/isValueObject.js';
export { isSeq } from './predicates/isSeq.js';
export { isList } from './predicates/isList.js';
export { isMap } from './predicates/isMap.js';
export { isOrderedMap } from './predicates/isOrderedMap.js';
export { isStack } from './predicates/isStack.js';
export { isSet } from './predicates/isSet.js';
export { isOrderedSet } from './predicates/isOrderedSet.js';
export { isRecord } from './predicates/isRecord.js';
import './CollectionImpl.js';
export { hash } from './Hash.js';
export { get } from './functional/get.js';
export { getIn } from './functional/getIn.js';
export { has } from './functional/has.js';
export { hasIn } from './functional/hasIn.js';
export { merge, mergeDeep, mergeDeepWith, mergeWith } from './functional/merge.js';
export { remove } from './functional/remove.js';
export { removeIn } from './functional/removeIn.js';
export { set } from './functional/set.js';
export { setIn } from './functional/setIn.js';
export { update } from './functional/update.js';
export { updateIn } from './functional/updateIn.js';
export { version } from './package.json.js';
import { Collection } from './Collection.js';

// Note: Iterable is deprecated
var Iterable = Collection;

export { Collection, Iterable };
