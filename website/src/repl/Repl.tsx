'use client';
import dynamic from 'next/dynamic';
import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useWorkerContext } from '../app/WorkerContext';
import { Element, JsonMLElementList } from '../worker/jsonml-types';
import { Editor } from './Editor';
import FormatterOutput from './FormatterOutput';
import './repl.css';

type Props = {
  defaultValue: string;
  onRun?: (code: string) => void;
  imports?: Array<string>;
};

function Repl({ defaultValue, onRun, imports }: Props): JSX.Element {
  const [code, setCode] = useState<string>(defaultValue);
  const [output, setOutput] = useState<JsonMLElementList | Element | undefined>(
    undefined
  );
  const { runCode: workerRunCode } = useWorkerContext();

  const runCode = useCallback(() => {
    workerRunCode(
      code,
      (result) => {
        if (onRun) {
          onRun(code);
        }
        setOutput(result);
      },
      (result) => setOutput(result)
    );
  }, [code, onRun, workerRunCode]);

  useEffect(() => {
    runCode();
  }, []);

  return (
    <div className="rd-repl">
      <div className="rd-repl__bar">
        <span className="rd-repl__dot" />
        <span className="rd-repl__label">Live example</span>
        <button type="button" className="rd-repl__run" onClick={runCode}>
          Run ▸
        </button>
      </div>

      <div className="rd-repl__editor">
        {imports && (
          <div className="rd-repl__imports">
            <Editor
              value={`import { ${imports.join(', ')} } from 'immutable';`}
            />
          </div>
        )}

        <Editor value={code} onChange={setCode} />
      </div>

      <div className="rd-repl__out">
        <span className="rd-repl__out-prefix">▸ </span>
        <FormatterOutput output={output} />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Repl), {
  ssr: false,
});
