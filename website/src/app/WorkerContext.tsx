'use client';
import React, {
  JSX,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Element, JsonMLElementList } from '../worker/jsonml-types';

type Props = {
  children: React.ReactNode;
};

type ResultHandler = (result: JsonMLElementList | Element) => void;

type ResultHandlers = {
  onSuccess: ResultHandler;
  onError: ResultHandler;
};

type WorkerContextType = {
  runCode: (
    code: string,
    onSuccess: ResultHandler,
    onError: ResultHandler
  ) => void;
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
  const [handlersMap, setHandlersMap] = useState<Map<string, ResultHandlers>>(
    new Map()
  );

  useEffect(() => {
    // Create a worker from the external worker.js file
    workerRef.current = new Worker(
      new URL('../worker/index.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (event: {
      data: {
        key: string;
        output: JsonMLElementList | Element;
        error?: string;
      };
    }) => {
      const handlers = handlersMap.get(event.data.key);

      if (!handlers) {
        console.warn(
          `No result handler found for key: ${event.data.key}. This is an issue with the single REPL worker.`
        );

        return;
      }

      if (event.data.error) {
        handlers.onError(['div', 'Error: ' + event.data.error]);
      } else {
        const { output } = event.data;

        if (typeof output === 'object' && !Array.isArray(output)) {
          handlers.onSuccess(['div', { object: output }]);
        } else {
          handlers.onSuccess(output);
        }
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runCode = useCallback(
    (code: string, onSuccess: ResultHandler, onError: ResultHandler): void => {
      const key = Math.random().toString(36).substring(2, 15);

      setHandlersMap((handlersMap) =>
        handlersMap.set(key, { onSuccess, onError })
      );

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
