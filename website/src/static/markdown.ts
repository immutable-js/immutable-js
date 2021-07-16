// @ts-ignore
import marked from 'marked';
import { Prism as prism } from './prism';
import type { TypeDefs, CallSignature, TypeDefinition } from '../TypeDefs';

export type MarkdownContext = {
  defs: TypeDefs;
  typeDef?: TypeDefinition;
  signatures?: Array<CallSignature>;
};

export function markdown(content: string, context: MarkdownContext) {
  if (!content) return content;

  const defs = context.defs;

  // functions come before keywords
  prism.languages.insertBefore('javascript', 'keyword', {
    var: /\b(this)\b/g,
    'block-keyword': /\b(if|else|while|for|function)\b/g,
    primitive: /\b(true|false|null|undefined)\b/g,
    function: prism.languages.function,
  });

  prism.languages.insertBefore('javascript', {
    qualifier: /\b[A-Z][a-z0-9_]+/g,
  });

  marked.setOptions({
    xhtml: true,
    highlight: (code: string) =>
      prism.highlight(code, prism.languages.javascript),
  });

  const renderer = new marked.Renderer();

  const runkitRegExp = /^<!--\s*runkit:activate((.|\n)*)-->(.|\n)*$/;
  const runkitContext = { options: '{}', activated: false };

  renderer.html = function (text: string) {
    const result = runkitRegExp.exec(text);

    if (!result) return text;

    runkitContext.activated = true;
    try {
      runkitContext.options = result[1] ? JSON.parse(result[1]) : {};
    } catch (e) {
      // @ts-ignore
      runkitContext.options = {};
    }
    return text;
  };

  renderer.code = function (code: string, lang: string, escaped: boolean) {
    if (this.options.highlight) {
      const out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    const runItButton = runkitContext.activated
      ? '<a class="try-it" data-options="' +
        escape(JSON.stringify(runkitContext.options)) +
        `" onClick="runIt(this,'${context.defs.version}')">run it</a>`
      : '';

    runkitContext.activated = false;
    runkitContext.options = '{}';

    return (
      '<code class="codeBlock">' +
      (escaped ? code : escapeCode(code)) +
      runItButton +
      '</code>'
    );
  };

  const TYPE_REF_RX = /^(Immutable\.)?([#.\w]+)(?:&lt;\w*&gt;)?(?:\(\w*\))?$/;
  const PARAM_RX = /^\w+$/;
  const MDN_TYPES: { [name: string]: string } = {
    Array: 'Global_Objects/Array',
    Object: 'Global_Objects/Object',
    JSON: 'Global_Objects/JSON',
    Iterable: 'Iteration_protocols#the_iterable_protocol',
    Iterator: 'Iteration_protocols#the_iterator_protocol',
  };
  const MDN_BASE_URL =
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/';

  renderer.codespan = function (text: string) {
    return (
      '<code>' + decorateCodeSpan(text, this.options.highlight) + '</code>'
    );
  };

  function decorateCodeSpan(
    text: string,
    highlight?: (code: string, lang: string) => string
  ) {
    if (
      context.signatures &&
      PARAM_RX.test(text) &&
      context.signatures.some(
        sig => sig.params && sig.params.some(param => param.name === text)
      )
    ) {
      return '<span class="t param">' + text + '</span>';
    }

    const typeRefResult = TYPE_REF_RX.exec(text);
    if (typeRefResult) {
      const [, immutableNS, elementsStr] = typeRefResult;
      const elements = elementsStr.split(/[#.]/g);
      const docLink = findTypeRefLink(immutableNS, elements);
      if (docLink) {
        const target = docLink.startsWith('http')
          ? ' target="_blank" rel="noopener"'
          : '';
        return `<a href="${docLink}"${target}>${text}</a>`;
      }
    }

    if (highlight) {
      return highlight(unescapeCode(text), prism.languages.javascript);
    }

    return text;
  }

  function findTypeRefLink(immutableNS: string, elements: Array<string>) {
    // Non namespaced links may resolve to an MDN url.
    if (!immutableNS && MDN_TYPES[elements[0]]) {
      return (
        MDN_BASE_URL +
        MDN_TYPES[elements[0]] +
        (elements[1] ? `/${elements[1]}` : '')
      );
    }

    // Try to resolve a member relative to the contextual type def if it's not
    // a direct namespace reference.
    if (!immutableNS && context.typeDef) {
      const ctxElements = [context.typeDef.qualifiedName].concat(elements);
      const url = findDocsUrl(defs, ctxElements);
      if (url) {
        return url;
      }
    }

    return findDocsUrl(defs, elements);
  }

  return marked(content, { renderer, context });
}

function findDocsUrl(defs: TypeDefs, elements: Array<string>) {
  // Try to resolve an interface member
  if (elements.length > 1) {
    const typeName = elements.slice(0, -1).join('.');
    const memberName = elements[elements.length - 1];
    const memberUrl = defs.types[typeName]?.interface?.members[memberName]?.url;
    if (memberUrl) {
      return memberUrl;
    }
  }

  // Otherwise try to resolve a type
  return defs.types[elements.join('.')]?.url;
}

function escapeCode(code: string) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescapeCode(code: string) {
  return code
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}
