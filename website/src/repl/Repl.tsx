'use client';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useState, type JSX } from 'react';
import { Editor } from './Editor';
import FormatterOutput from './FormatterOutput';
import { Element, JsonMLElementList } from '../worker/jsonml-types';
import { useWorkerContext } from '../app/WorkerContext';
import './repl.css';

type Props = {
  defaultValue: string;
  onRun?: (code: string) => void;
  imports?: Array<string>;
};

function Repl({ defaultValue, onRun, imports }: Props): JSX.Element {
  const [code, setCode] = useState<string>(defaultValue);
  const [output, setOutput] = useState<JsonMLElementList | Element>([]);
  const { runCode: workerRunCode } = useWorkerContext();

  const onSuccess = (result: JsonMLElementList | Element): void => {
    if (onRun) {
      onRun(code);
    }

    setOutput(result);
  };

  const runCode = useCallback(() => {
    workerRunCode(code, onSuccess);
  }, [code, onSuccess, workerRunCode]);

  useEffect(() => {
    runCode();
  }, []);

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
