import type { MDXComponents } from 'mdx/types';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/';

loadLanguages(['ts']);

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    code: ({ className, children, ...rest }) => {
      if (!className) {
        // no classname : no need to handle syntax highlighting
        return <code {...rest}>{children}</code>;
      }

      const language = className.replace('language-', '');
      const html = Prism.highlight(
        String(children).trim(),
        Prism.languages[language] || Prism.languages.plaintext,
        language
      );

      return (
        <code
          className={`codeBlock language-${language}`}
          dangerouslySetInnerHTML={{ __html: html }}
          {...rest}
        />
      );
    },
    MemberLabel: ({ label, alias }: { label: string; alias?: string }) => {
      return (
        <div id={label}>
          <h3 className="memberLabel">
            <a className="anchor" href={`#${label}`}>
              {label}
              <span className="anchorLink">§</span>
            </a>
          </h3>
          {alias && (
            <>
              <h4 className="infoHeader">
                Alias: <code>{alias}</code>
              </h4>
            </>
          )}
        </div>
      );
    },
    Signature: ({ code }) => {
      const language = 'ts';
      const html = Prism.highlight(
        String(code).trim(),
        Prism.languages[language],
        language
      );

      return (
        <div>
          <h4>Method signature</h4>
          <pre>
            <code
              className="codeBlock memberSignature"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </pre>
        </div>
      );
    },
    ...components,
  };
}
