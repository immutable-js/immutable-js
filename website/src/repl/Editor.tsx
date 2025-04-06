import { useEffect, useRef, useState } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { EditorState, Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
// TODO activate this when we have a dark mode
import { oneDark } from '@codemirror/theme-one-dark';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function useDarkMode() {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(darkModeMediaQuery.matches);

  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, [darkModeMediaQuery]);

  return darkMode;
}

export function Editor({ value, onChange }: Props): JSX.Element {
  const editor = useRef<HTMLDivElement>(null);
  const darkMode = useDarkMode();

  const onUpdate = EditorView.updateListener.of((v) => {
    onChange(v.state.doc.toString());
  });

  useEffect(() => {
    if (!editor.current) {
      return;
    }
    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        keymap.of([...defaultKeymap, indentWithTab]),
        javascript(),
        darkMode ? oneDark : undefined,

        onUpdate,
      ].filter(
        (value: Extension | undefined): value is Extension =>
          typeof value !== 'undefined'
      ),
    });

    const view = new EditorView({
      state: startState,
      parent: editor.current,
    });

    return () => {
      view.destroy();
    };
  }, [darkMode]);

  return <div className="repl-editor" ref={editor}></div>;
}
