'use client';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState, type JSX } from 'react';
import { Editor } from './Editor';
import FormatterOutput from './FormatterOutput';
import './repl.css';

type Props = {
  defaultValue: string;
  imports?: Array<string>;
};

function Repl({ defaultValue, imports }: Props): JSX.Element {
  const [code, setCode] = useState<string>(defaultValue);
  const [output, setOutput] = useState<{
    header: Array<unknown>;
    body?: Array<unknown>;
  }>({ header: [] });
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const workerScript = `
    importScripts('https://cdn.jsdelivr.net/npm/immutable@5.1.1', 'https://cdn.jsdelivr.net/npm/@jdeniau/immutable-devtools@0.2.0');

      // extract all Immutable exports to have them available in the worker automatically
      const {
        version,
        Collection,
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

      immutableDevTools(Immutable);

      // hack to get the formatters from immutable-devtools as they are not exported, but they modify the "global" variable
      const immutableFormaters = globalThis.devtoolsFormatters;

      // console.log(immutableFormaters)

      function normalizeResult(result) {
        if (!result) {
          return undefined;
        }

        const formatter = immutableFormaters.find((formatter) => formatter.header(result));
  
        if (!formatter) {
          return undefined;
        }
        
        return {
          header: formatter.header(result),
          body: formatter.hasBody(result) ? formatter.body(result) : undefined,
        }
      }
      
      self.onmessage = function(event) {
        let timeoutId = setTimeout(() => {
          self.postMessage({ error: "Execution timed out" });
          self.close();
        }, 2000);

        try {
        // track globalThis variables to remove them later
          if (!globalThis.globalThisKeysBefore) {
            globalThis.globalThisKeysBefore = [...Object.keys(globalThis)];
          }

          let code = event.data;

          // track const and let variables into global scope to record them
          // it might make a userland code fail with a conflict.
          // We might want to indicate the user in the REPL that they should not use let/const if they want to have the result returned
          // code = code.replace(/^(const|let|var) /gm, ''); 
        
          let result = eval(code);

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

          self.postMessage({ output: normalizeResult(result) });
        } catch (error) {
         console.log(error);
          clearTimeout(timeoutId);
          self.postMessage({ error: String(error) });
        }
      };
    `;

    const workerBlob = new Blob([workerScript], {
      type: 'application/javascript',
    });
    workerRef.current = new Worker(URL.createObjectURL(workerBlob));

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    runCode();
  }, []);

  const runCode = () => {
    if (workerRef.current) {
      // ignore import statements as we do unpack all immutable data in the worker
      // but it might be useful in the documentation
      const cleanedCode = code.replace(/^import.*/m, '');

      workerRef.current.postMessage(cleanedCode);
      workerRef.current.onmessage = (event) => {
        if (event.data.error) {
          setOutput({ header: ['div', 'Error: ' + event.data.error] });
        } else {
          setOutput(event.data.output);
        }
      };
    }
  };

  return (
    <div className="js-repl">
      <h4>Live example</h4>

      <div className="repl-editor-container">
        <div className="repl-editor">
          {imports && (
            <Editor
              value={`import { ${imports.join(', ')} } from 'immutable';`}
            />
          )}

          <Editor value={code} onChange={setCode} />
        </div>

        <button type="button" onClick={runCode}>
          Run
        </button>
      </div>

      {output && (
        <pre className="repl-output">
          <FormatterOutput output={output} />
        </pre>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Repl), {
  ssr: false,
});
