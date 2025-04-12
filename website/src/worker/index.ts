/// <reference lib="webworker" />
import type * as ImmutableModule from '../../../type-definitions/immutable.js';
import normalizeResult, { DevToolsFormatter } from './normalizeResult';

// Declare Immutable and immutableDevTools as they come from external scripts
declare const Immutable: typeof ImmutableModule;

declare function immutableDevTools(immutable: typeof ImmutableModule): void;

// Declare globalThis.devtoolsFormatters
declare global {
  // eslint-disable-next-line no-var
  var devtoolsFormatters: DevToolsFormatter[];
}

importScripts(
  'https://cdn.jsdelivr.net/npm/immutable@5.1.1',
  'https://cdn.jsdelivr.net/npm/@jdeniau/immutable-devtools@0.2.0'
);

// extract all Immutable exports to have them available in the worker automatically
/* eslint-disable @typescript-eslint/no-unused-vars */
const {
  // @ts-expect-error type is not exported but runtime is OK
  version,
  Collection,
  // @ts-expect-error type is not exported but runtime is OK
  // Note: Iterable is deprecated, alias for Collection
  Iterable,
  Seq,
  Map,
  OrderedMap,
  List,
  Stack,
  Set,
  OrderedSet,
  PairSorting,
  Record,
  Range,
  Repeat,
  is,
  fromJS,
  hash,
  isImmutable,
  isCollection,
  isKeyed,
  isIndexed,
  isAssociative,
  isOrdered,
  // @ts-expect-error type is not exported but runtime is OK
  isPlainObject,
  isValueObject,
  isSeq,
  isList,
  isMap,
  isOrderedMap,
  isStack,
  isSet,
  isOrderedSet,
  isRecord,
  get,
  getIn,
  has,
  hasIn,
  merge,
  mergeDeep,
  mergeWith,
  mergeDeepWith,
  remove,
  removeIn,
  set,
  setIn,
  update,
  updateIn,
} = Immutable;
/* eslint-enable @typescript-eslint/no-unused-vars */

immutableDevTools(Immutable);

// hack to get the formatters from immutable-devtools as they are not exported, but they modify the "global" variable
const immutableFormaters = globalThis.devtoolsFormatters;

self.onmessage = function (event) {
  const timeoutId = setTimeout(() => {
    self.postMessage({ error: 'Execution timed out' });
    self.close();
  }, 2000);

  try {
    // track globalThis variables to remove them later

    // if (!globalThis.globalThisKeysBefore) {
    //   globalThis.globalThisKeysBefore = [...Object.keys(globalThis)];
    // }

    const code = event.data;

    // track const and let variables into global scope to record them

    // it might make a userland code fail with a conflict.

    // We might want to indicate the user in the REPL that they should not use let/const if they want to have the result returned

    // code = code.replace(/^(const|let|var) /gm, '');

    const result = eval(code);

    // const globalThisKeys = Object.keys(globalThis).filter((key) => {

    //   return !globalThisKeysBefore.includes(key) && key !== 'globalThisKeysBefore';

    // });

    // console.log(globalThisKeys)

    clearTimeout(timeoutId);

    // TODO handle more than one result

    // if (!result) {

    //   // result = globalThis[globalThisKeys[0]];

    //   result = globalThisKeys.map((key) => {

    //     globalThis[key];

    //   });

    // }

    self.postMessage({ output: normalizeResult(immutableFormaters, result) });
  } catch (error) {
    console.log(error);
    clearTimeout(timeoutId);
    self.postMessage({ error: String(error) });
  }
};
