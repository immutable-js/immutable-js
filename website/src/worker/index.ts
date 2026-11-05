/// <reference lib="webworker" />
import type * as ImmutableModule from '../../../type-definitions/immutable.js';
import { Element, JsonMLElementList } from './jsonml-types';
import normalizeResult, { DevToolsFormatter } from './normalizeResult';

// Declare Immutable as they come from external scripts
declare const Immutable: typeof ImmutableModule;

// Declare globalThis.devtoolsFormatters
declare global {
  // eslint-disable-next-line no-var
  var devtoolsFormatters: DevToolsFormatter[];
}

importScripts('https://cdn.jsdelivr.net/npm/immutable');

const CAPTURED_CONSOLE_METHODS = [
  'log',
  'info',
  'warn',
  'error',
  'debug',
] as const;

/**
 * Redirect the `console` calls to `lines` instead of the browser console, until the returned function is called.
 */
function captureConsole(
  immutableFormaters: Array<DevToolsFormatter>,
  lines: Array<JsonMLElementList | Element>
): () => void {
  const originals = CAPTURED_CONSOLE_METHODS.map((method) => console[method]);

  CAPTURED_CONSOLE_METHODS.forEach((method) => {
    console[method] = (...args: Array<unknown>) => {
      const parts: Array<JsonMLElementList | Element> = [];

      args.forEach((arg, index) => {
        if (index > 0) {
          parts.push(' ');
        }

        // like the browsers, strings are logged without quotes
        parts.push(
          typeof arg === 'string'
            ? arg
            : normalizeResult(immutableFormaters, arg)
        );
      });

      lines.push(['div', ...parts]);
    };
  });

  return () => {
    CAPTURED_CONSOLE_METHODS.forEach((method, index) => {
      console[method] = originals[index];
    });
  };
}

(async () => {
  const immutableDevTools = (await import('@immutable/devtools')).default;
  immutableDevTools(Immutable);

  // hack to get the formatters from immutable-devtools as they are not exported, but they modify the "global" variable
  const immutableFormaters: Array<DevToolsFormatter> =
    globalThis.devtoolsFormatters;

  self.onmessage = function (event: {
    data: { code: string; key: string };
  }): void {
    const { code, key } = event.data;

    const timeoutId = setTimeout(() => {
      self.postMessage({ key, lines: [], error: 'Execution timed out' });
      self.close();
    }, 2000);

    const lines: Array<JsonMLElementList | Element> = [];
    const restoreConsole = captureConsole(immutableFormaters, lines);

    try {
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

      // track globalThis variables to remove them later

      // if (!globalThis.globalThisKeysBefore) {
      //   globalThis.globalThisKeysBefore = [...Object.keys(globalThis)];
      // }

      // track const and let variables into global scope to record them

      // it might make a userland code fail with a conflict.

      // We might want to indicate the user in the REPL that they should not use let/const if they want to have the result returned

      // code = code.replace(/^(const|let|var) /gm, '');

      const result = eval(code);

      restoreConsole();

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

      // only display `undefined` if nothing has been logged, like after a trailing `console.log()`
      if (result !== undefined || lines.length === 0) {
        lines.push(['div', normalizeResult(immutableFormaters, result)]);
      }

      self.postMessage({ key, lines });
    } catch (error) {
      restoreConsole();
      console.log(error);
      clearTimeout(timeoutId);
      self.postMessage({ key, lines, error: String(error) });
    }
  };
})().catch((error) => {
  console.error('Worker initialization failed:', error);
  self.close();
});
