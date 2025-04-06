import { toHTML } from 'jsonml-html';
import { useEffect, useRef } from 'react';

/**
 * immutable-devtools is a console custom formatter.
 * Console formatters does use jsonml format.
 * {@see https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html} for a documentation from the Firefox team.
 * The `jsonml-html` package can convert jsonml to HTML.
 */
type Props = {
  output: {
    header: Array<unknown>;
    body?: Array<unknown>;
  };
};

export default function FormatterOutput({ output }: Props): JSX.Element {
  const header = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  const htmlHeader = toHTML(output.header);

  useEffect(() => {
    if (header.current && htmlHeader) {
      header.current.replaceChildren(htmlHeader);
    }
  }, [htmlHeader]);

  const htmlBody = output.body ? toHTML(output.body) : null;

  useEffect(() => {
    if (body.current) {
      body.current.replaceChildren(htmlBody ?? '');
    }
  }, [htmlBody]);

  return (
    <>
      <div ref={header}></div>
      <div ref={body}></div>
    </>
  );
}
