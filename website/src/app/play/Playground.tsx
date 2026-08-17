'use client';

import { type JSX, useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '../../Header';
import { Editor } from '../../repl/Editor';
import FormatterOutput from '../../repl/FormatterOutput';
import { Element, JsonMLElementList } from '../../worker/jsonml-types';
import { useWorkerContext } from '../WorkerContext';
import { VERSION } from '../docs/currentVersion';
import { bytesToString, stringToBytes } from './encoder';
import './playground.css';

const DEFAULT = `const upperFirst = (str) =>
  typeof str === 'string'
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : str;

List([
  'apple',
  'banana',
  'coconut',
])
  .push('dragonfruit')
  .map((fruit) => upperFirst(fruit));`;

const PRESETS: Array<{ id: string; label: string; code: string }> = [
  { id: 'fruits', label: 'Fruits', code: DEFAULT },
  {
    id: 'range',
    label: 'Range',
    code: `Range(1, Infinity)
  .filter((n) => n % 3 === 0)
  .take(5)
  .toList();`,
  },
  {
    id: 'map',
    label: 'Map',
    code: `Map({ a: 1, b: 2, c: 3 })
  .set('b', 50)
  .mapKeys((k) => k.toUpperCase());`,
  },
];

const ShareIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
    <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
  </svg>
);

/** The code to start from: the URL hash if present, else the default. */
function readInitialCode(): string {
  if (typeof window !== 'undefined') {
    try {
      if (window.location.hash && window.location.hash.length > 1) {
        return bytesToString(window.location.hash.slice(1));
      }
    } catch {
      // ignore malformed hash
    }
  }
  return DEFAULT;
}

export default function Playground(): JSX.Element {
  const { runCode: workerRunCode } = useWorkerContext();

  const [code, setCode] = useState(readInitialCode);
  const [epoch, setEpoch] = useState(0);
  const [output, setOutput] = useState<JsonMLElementList | Element | undefined>(
    undefined
  );
  const [ok, setOk] = useState<boolean | null>(null);
  const [active, setActive] = useState(
    () => PRESETS.find((preset) => preset.code === code)?.id ?? ''
  );
  const [shareLabel, setShareLabel] = useState('Share');
  const codeRef = useRef(code);
  const shareTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  codeRef.current = code;

  const run = useCallback(() => {
    const code = codeRef.current;
    // Keep the current code in the URL hash so the playground is bookmarkable
    // and shareable straight from the address bar.
    try {
      window.location.hash = stringToBytes(code);
    } catch {
      // ignore
    }

    workerRunCode(
      code,
      (result) => {
        setOutput(result);
        setOk(true);
      },
      (result) => {
        setOutput(result);
        setOk(false);
      }
    );
  }, [workerRunCode]);

  // Replace the editor's content (forces a CodeMirror remount) then run.
  const loadCode = useCallback(
    (next: string) => {
      setCode(next);
      codeRef.current = next;
      setEpoch((e) => e + 1);
      // Run on the next tick so codeRef is settled.
      setTimeout(run, 0);
    },
    [run]
  );

  // Auto-run the initial code (from the hash or the default) once on mount.
  useEffect(() => {
    run();
  }, []);

  const pickPreset = (preset: (typeof PRESETS)[number]) => {
    setActive(preset.id);
    loadCode(preset.code);
  };

  const reset = () => {
    setActive('fruits');
    loadCode(DEFAULT);
  };

  const share = () => {
    try {
      window.location.hash = stringToBytes(codeRef.current);
    } catch {
      // ignore
    }
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // ignore
    }
    setShareLabel('Copied!');
    if (shareTimeout.current) {
      clearTimeout(shareTimeout.current);
    }

    shareTimeout.current = setTimeout(() => {
      setShareLabel('Share');
    }, 1600);
  };

  return (
    <div className="pg-root">
      <Header flush />

      {/* TOOLBAR */}
      <div className="pg-toolbar">
        <div>
          <div className="pg-title">
            <h1>Playground</h1>
            <span className="pg-badge">{VERSION}</span>
          </div>
          <div className="pg-hint">
            Edit, run and share Immutable.js — the URL saves your code.
          </div>
        </div>

        <div className="pg-presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => pickPreset(preset)}
              className={`pg-preset ${
                active === preset.id ? 'pg-preset--active' : ''
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="pg-spacer" />

        <button type="button" className="pg-btn" onClick={reset}>
          Reset
        </button>
        <button type="button" className="pg-btn pg-btn--strong" onClick={share}>
          <ShareIcon />
          {shareLabel}
        </button>
        <button type="button" className="pg-run" onClick={run}>
          Run ▸
        </button>
      </div>

      {/* WORKSPACE */}
      <div className="pg-workspace">
        <div className="pg-pane pg-pane--editor">
          <div className="pg-pane__bar">
            <span className="pg-pane__name">playground.ts</span>
            <span className="pg-dot pg-dot--accent" />
            <span className="pg-status">sandboxed worker</span>
          </div>
          <div className="pg-editor">
            <Editor key={epoch} value={code} onChange={setCode} />
          </div>
        </div>

        <div className="pg-pane pg-pane--result">
          <div className="pg-pane__bar">
            <span className="pg-pane__name">Result</span>
            <span
              className={`pg-dot ${ok === false ? 'pg-dot--error' : 'pg-dot--accent'}`}
            />
          </div>
          <div
            className={`pg-result ${
              ok === false
                ? 'pg-result--error'
                : output
                  ? 'pg-result--ok'
                  : 'pg-result--placeholder'
            }`}
          >
            {output ? (
              <FormatterOutput output={output} />
            ) : (
              '// run to see the result'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
