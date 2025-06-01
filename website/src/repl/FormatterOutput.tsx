import { toHTML } from 'jsonml-html';
import { type JSX, useEffect, useRef } from 'react';
import { Element, JsonMLElementList } from '../worker/jsonml-types';

/**
 * immutable-devtools is a console custom formatter.
 * Console formatters does use jsonml format.
 * {@see https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html} for a documentation from the Firefox team.
 * The `jsonml-html` package can convert jsonml to HTML.
 */
type Props = {
  output: undefined | JsonMLElementList | Element;
};

export default function FormatterOutput({ output }: Props): JSX.Element {
  const header = useRef<HTMLDivElement>(null);

  const htmlHeader = output ? toHTML(output) : undefined;

  useEffect(() => {
    if (header.current && htmlHeader) {
      header.current.replaceChildren(htmlHeader);
    }
  }, [htmlHeader]);

  return <div ref={header}></div>;
}
