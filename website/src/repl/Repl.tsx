'use client';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState, type JSX } from 'react';
import { Editor } from './Editor';
import FormatterOutput from './FormatterOutput';
import './repl.css';
import { Element, JsonMLElementList } from '../worker/jsonml-types';

type Props = { defaultValue: string; onRun?: (code: string) => void };

function Repl({ defaultValue, onRun }: Props): JSX.Element {
  const [code, setCode] = useState<string>(defaultValue);
  const [output, setOutput] = useState<JsonMLElementList | Element>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create a worker from the external worker.js file
    workerRef.current = new Worker(
      new URL('../worker/index.ts', import.meta.url)
    );

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    runCode();
  }, []);

  const runCode = () => {
    if (workerRef.current) {
      // notify parent
      if (onRun) {
        onRun(code);
      }

      // send message to worker
      workerRef.current.postMessage(code);
      workerRef.current.onmessage = (event) => {
        if (event.data.error) {
          setOutput(['div', 'Error: ' + event.data.error]);
        } else {
          const { output } = event.data;

          if (typeof output === 'object' && !Array.isArray(output)) {
            setOutput(['div', { object: output }]);
          } else {
            setOutput(output);
          }
        }
      };
    }
  };

  return (
    <div className="js-repl">
      <h4>Live example</h4>

      <div className="repl-editor-container">
        <Editor value={code} onChange={setCode} />

        <button type="button" onClick={runCode}>
          Run
        </button>
      </div>

      <pre id="output">
        <FormatterOutput output={output} />
      </pre>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Repl), {
  ssr: false,
});
