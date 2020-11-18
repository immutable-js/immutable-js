/* eslint-env browser */
global.runIt = function runIt(button) {
  if (!global.RunKit) return;

  const container = document.createElement('div');
  const codeElement = button.parentNode;
  const parent = codeElement.parentNode;

  parent.insertBefore(container, codeElement);
  parent.removeChild(codeElement);
  codeElement.removeChild(button);

  const options = JSON.parse(unescape(button.dataset.options));

  function withCorrectVersion(code) {
    return code.replace(
      /require\('immutable'\)/g,
      "require('immutable@4.0.0-rc.9')"
    );
  }

  global.RunKit.createNotebook({
    element: container,
    nodeVersion: options.nodeVersion || '*',
    preamble: withCorrectVersion(
      'const assert = (' +
        makeAssert +
        ")(require('immutable'));" +
        (options.preamble || '')
    ),
    source: withCorrectVersion(
      codeElement.textContent.replace(/\n(>[^\n]*\n?)+$/g, '')
    ),
    minHeight: '52px',
    onLoad: function (notebook) {
      notebook.evaluate();
    },
  });
};

function makeAssert(I) {
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

  function compare(lhs, rhs, same, identical) {
    const both = !identical && isIterable(lhs) && isIterable(rhs);

    if (both) return lhs.equals(rhs);

    return lhs === rhs;
  }

  function message(lhs, rhs, same, identical) {
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

  function equal(lhs, rhs) {
    return message(lhs, rhs, true);
  }

  function notEqual(lhs, rhs) {
    return message(lhs, rhs, false);
  }

  function strictEqual(lhs, rhs) {
    return message(lhs, rhs, true, true);
  }

  function notStrictEqual(lhs, rhs) {
    return message(lhs, rhs, false, true);
  }

  return { equal, notEqual, strictEqual, notStrictEqual };
}
