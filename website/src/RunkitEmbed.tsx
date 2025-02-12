import Script from 'next/script';

export function RunkitEmbed() {
  return <Script src="//embed.runkit.com" onLoad={onLoadRunkit} />;
}

function onLoadRunkit() {
  // @ts-expect-error -- need proper types for RunKit ?
  global.runIt = runIt;
}

function runIt(button: HTMLElement, version: string) {
  // @ts-expect-error -- need proper types for RunKit ?
  const RunKit = global.RunKit;
  if (!RunKit) return;

  const container = document.createElement('div');
  const codeElement = button.parentNode!;
  const parent = codeElement.parentNode!;

  parent.insertBefore(container, codeElement);
  parent.removeChild(codeElement);
  codeElement.removeChild(button);

  const options = JSON.parse(unescape(button.dataset.options || ''));

  function withCorrectVersion(code: string) {
    const replacement =
      version === 'latest@main'
        ? 'immutable'
        : `immutable@${version.replace(/^v/, '')}`;
    return code.replace(/require\('immutable'\)/g, `require('${replacement}')`);
  }

  RunKit.createNotebook({
    element: container,
    nodeVersion: options.nodeVersion || '*',
    preamble: withCorrectVersion(
      'const assert = (' +
        makeAssert +
        ")(require('immutable'));" +
        (options.preamble || '')
    ),
    source: withCorrectVersion(
      codeElement.textContent!.replace(/\n(>[^\n]*\n?)+$/g, '')
    ),
    minHeight: '52px',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onLoad(notebook: any) {
      notebook.evaluate();
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeAssert(I: any) {
  const isIterable = I.isIterable || I.Iterable.isIterable;
  let html = `
    <style>
      * {
        font-size: 14px;
        font-family: monospace;
      }

      code {
        font-family: monospace;
        color: #4183C4;
        text-decoration: none;
        text-decoration: none;
        background: rgba(65, 131, 196, 0.1);
        border-radius: 2px;
        padding: 2px;
    }

      .success {
        color: rgba(84,184,54,1.0);
      }

      .success:before {
        content: "✅";
      }

      .failure {
        color: rgba(220,47,33,1.0);
      }

      .failure i {
        color: rgba(210,44,31,1.0);
      }

      .failure:before {
        content: "❌";
      }
    </style>`;

  function compare(
    lhs: unknown,
    rhs: unknown,
    _same: boolean,
    identical: boolean
  ) {
    const both = !identical && isIterable(lhs) && isIterable(rhs);

    // @ts-expect-error -- this is an immutable value
    if (both) return lhs.equals(rhs);

    return lhs === rhs;
  }

  function message(
    lhs: unknown,
    rhs: unknown,
    same: boolean,
    identical: boolean
  ) {
    const result = compare(lhs, rhs, same, identical);
    const comparison = result
      ? identical
        ? 'strict equal to'
        : 'does equal'
      : identical
        ? 'not strict equal to'
        : 'does not equal';
    const className = result === same ? 'success' : 'failure';
    const lhsString = isIterable(lhs) ? lhs + '' : JSON.stringify(lhs);
    const rhsString = isIterable(rhs) ? rhs + '' : JSON.stringify(rhs);

    return (html += `
      <span class="${className}">
        <code>${lhsString}</code>
        ${comparison}
        <code>${rhsString}</code>
      </span><br/>`);
  }

  function equal(lhs: unknown, rhs: unknown) {
    return message(lhs, rhs, true, false);
  }

  function notEqual(lhs: unknown, rhs: unknown) {
    return message(lhs, rhs, false, false);
  }

  function strictEqual(lhs: unknown, rhs: unknown) {
    return message(lhs, rhs, true, true);
  }

  function notStrictEqual(lhs: unknown, rhs: unknown) {
    return message(lhs, rhs, false, true);
  }

  return { equal, notEqual, strictEqual, notStrictEqual };
}
