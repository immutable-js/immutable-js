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
    Signature: ({ code }) => {
      const language = 'ts';
      console.log(code);
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
