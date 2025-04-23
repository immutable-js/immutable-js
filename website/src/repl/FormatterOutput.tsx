import { toHTML } from 'jsonml-html';
import { useEffect, useRef, type JSX } from 'react';

/**
 * immutable-devtools is a console custom formatter.
 * Console formatters does use jsonml format.
 * {@see https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html} for a documentation from the Firefox team.
 * The `jsonml-html` package can convert jsonml to HTML.
 */
type Props = {
  output: Array<unknown>;
};

export default function FormatterOutput({ output }: Props): JSX.Element {
  const header = useRef<HTMLDivElement>(null);

  const htmlHeader = toHTML(output);

  useEffect(() => {
    if (header.current && htmlHeader) {
      header.current.replaceChildren(htmlHeader);
    }
  }, [htmlHeader]);

  return <div ref={header}></div>;
}
