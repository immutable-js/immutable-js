import type { MDXComponents } from 'mdx/types';
import Prism from 'prismjs';
// Static grammar imports (side-effect): these register on the shared Prism
// instance and, unlike loadLanguages()'s dynamic require, survive bundling
// (Turbopack) so the grammars exist during static prerendering.
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-json.js';
import { slugify } from './slug';

/**
 * Highlight `code` for `language`, returning HTML — or null if that grammar
 * isn't available (caller then renders the raw text without highlighting).
 */
function highlight(code: string, language: string): string | null {
  const grammar = Prism.languages[language];
  if (!grammar) {
    return null;
  }

  return Prism.highlight(code, grammar, language);
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Give section headings stable ids so the "On this page" TOC anchors work.
    h2: ({ children, ...rest }) => (
      <h2 id={slugify(String(children))} {...rest}>
        {children}
      </h2>
    ),
    code: ({ className, children, ...rest }) => {
      if (!className) {
        // no classname : no need to handle syntax highlighting
        return <code {...rest}>{children}</code>;
      }

      const language = className.replace('language-', '');
      const html = highlight(String(children).trim(), language);

      if (html === null) {
        // Unknown grammar — render the code without highlighting.
        return (
          <code className={`codeBlock language-${language}`} {...rest}>
            {children}
          </code>
        );
      }

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
              <h4 className="infoHeader">Alias:</h4>
              <code>{alias}</code>
            </>
          )}
        </div>
      );
    },
    See: ({ code }: { code: string }) => {
      return (
        <>
          <h4 className="infoHeader">See</h4>
          <code>{code}</code>
        </>
      );
    },
    Signature: ({ code }) => {
      const src = String(code).trim();
      const html = highlight(src, 'ts');

      return (
        <pre className="memberSignature">
          {html === null ? (
            <code className="codeBlock language-ts">{src}</code>
          ) : (
            <code
              className="codeBlock language-ts"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </pre>
      );
    },
    ...components,
  };
}
