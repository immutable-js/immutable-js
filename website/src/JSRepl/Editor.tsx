import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function Editor({ value, onChange }: Props): JSX.Element {
  const editor = useRef<HTMLDivElement>(null);

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
        keymap.of([...defaultKeymap]),
        javascript(),
        // oneDark,

        onUpdate,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editor.current,
    });

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div
      style={{ border: '1px solid var(--code-block-bg-color)' }}
      ref={editor}
    ></div>
  );
}
