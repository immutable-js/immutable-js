'use client';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState, type JSX } from 'react';
import { Editor } from './Editor';
import FormatterOutput from './FormatterOutput';
import './repl.css';

type Props = { defaultValue: string; onRun?: (code: string) => void };

function Repl({ defaultValue, onRun }: Props): JSX.Element {
  const [code, setCode] = useState<string>(defaultValue);
  const [output, setOutput] = useState<{
    header: Array<unknown>;
    body?: Array<unknown>;
  }>({ header: [] });
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
