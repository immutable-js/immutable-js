'use client';
import React, { useEffect, useRef, useState } from 'react';
import './JSRepl.css';
import { Editor } from './Editor';

type Props = { defaultValue: string };

function JSRepl({ defaultValue }: Props): JSX.Element {
  const [code, setCode] = useState<string>(defaultValue);
  const [output, setOutput] = useState<string>('');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const workerScript = `
    importScripts('https://cdn.jsdelivr.net/npm/immutable@5.1.1');

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

      self.onmessage = function(event) {
        let timeoutId = setTimeout(() => {
          self.postMessage({ error: "Execution timed out" });
          self.close();
        }, 2000);

        try {
          const result = eval(event.data);
          clearTimeout(timeoutId);
          self.postMessage({ output: String(result) });
        } catch (error) {
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
      workerRef.current.postMessage(code);
      workerRef.current.onmessage = (event) => {
        if (event.data.error) {
          setOutput('Error: ' + event.data.error);
        } else {
          setOutput('Output: ' + event.data.output);
        }
      };
    }
  };

  return (
    <div className="js-repl">
      <h4>Live example</h4>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <Editor value={code} onChange={setCode} />
        </div>

        <button type="button" onClick={runCode}>
          Run
        </button>
      </div>

      <pre id="output">{output}</pre>
    </div>
  );
}

export default JSRepl;
