'use client';
import { Element, JsonMLElementList } from '../worker/jsonml-types';
import React, {
  createContext,
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type Props = {
  children: React.ReactNode;
};

type OnSuccessType = (result: JsonMLElementList | Element) => void;

type WorkerContextType = {
  runCode: (code: string, onSuccess: OnSuccessType) => void;
};

const WorkerContext = createContext<null | WorkerContextType>(null);

export function useWorkerContext() {
  const context = React.useContext(WorkerContext);

  if (!context) {
    throw new Error('useWorkerContext must be used within a WorkerProvider');
  }

  return context;
}

export function WorkerContextProvider({ children }: Props): JSX.Element {
  const workerRef = useRef<Worker | null>(null);
  const [successMap, setSuccessMap] = useState<Map<string, OnSuccessType>>(
    new Map()
  );

  useEffect(() => {
    // Create a worker from the external worker.js file
    workerRef.current = new Worker(
      new URL('../worker/index.ts', import.meta.url)
    );

    workerRef.current.onmessage = (event: {
      data: {
        key: string;
        output: JsonMLElementList | Element;
        error?: string;
      };
    }) => {
      const onSuccess = successMap.get(event.data.key);

      if (!onSuccess) {
        console.warn(
          `No success handler found for key: ${event.data.key}. This is an issue with the single REPL worker.`
        );

        return;
      }

      if (event.data.error) {
        onSuccess(['div', 'Error: ' + event.data.error]);
      } else {
        const { output } = event.data;

        if (typeof output === 'object' && !Array.isArray(output)) {
          onSuccess(['div', { object: output }]);
        } else {
          onSuccess(output);
        }
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runCode = useCallback(
    (code: string, onSuccess: OnSuccessType): void => {
      const key = Math.random().toString(36).substring(2, 15);

      setSuccessMap((successMap) => successMap.set(key, onSuccess));

      // ignore import statements as we do unpack all immutable data in the worker
      // but it might be useful in the documentation
      const cleanedCode = code; // .replace(/^import.*/m, '');

      // send message to worker
      if (workerRef.current) {
        workerRef.current.postMessage({ code: cleanedCode, key });
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      runCode,
    }),
    [runCode]
  );

  return (
    <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>
  );
}
