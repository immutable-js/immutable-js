/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var { Seq } = require('../../');
var marked = require('marked');
var prism = require('./prism');
var collectMemberGroups = require('./collectMemberGroups');
// Note: intentionally using raw defs, not getTypeDefs to avoid circular ref.
var defs = require('../generated/immutable.d.json');

function collectAllMembersForAllTypes(defs) {
  var allMembers = new WeakMap();
  _collectAllMembersForAllTypes(defs);
  return allMembers;
  function _collectAllMembersForAllTypes(defs) {
    Seq(defs).forEach((def) => {
      if (def.interface) {
        var groups = collectMemberGroups(def.interface, {
          showInherited: true,
        });
        allMembers.set(
          def.interface,
          Seq.Keyed(
            groups[''].map((member) => [member.memberName, member.memberDef])
          ).toObject()
        );
      }
      if (def.module) {
        _collectAllMembersForAllTypes(def.module);
      }
    });
    return allMembers;
  }
}

var allMembers = collectAllMembersForAllTypes(defs);

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
  highlight: (code) => prism.highlight(code, prism.languages.javascript),
});

var renderer = new marked.Renderer();

const runkitRegExp = /^<!--\s*runkit:activate((.|\n)*)-->(.|\n)*$/;
const runkitContext = { options: '{}', activated: false };

renderer.html = function (text) {
  const result = runkitRegExp.exec(text);

  if (!result) return text;

  runkitContext.activated = true;
  try {
    runkitContext.options = result[1] ? JSON.parse(result[1]) : {};
  } catch (e) {
    runkitContext.options = {};
  }
  return text;
};

renderer.code = function (code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  const runItButton = runkitContext.activated
    ? '<a class="try-it" data-options="' +
      escape(JSON.stringify(runkitContext.options)) +
      '" onClick="runIt(this)">run it</a>'
    : '';

  runkitContext.activated = false;
  runkitContext.options = '{}';

  return (
    '<code class="codeBlock">' +
    (escaped ? code : escapeCode(code, true)) +
    runItButton +
    '</code>'
  );
};

var METHOD_RX = /^(\w+)(?:[#.](\w+))?(?:\(\))?$/;
var PARAM_RX = /^\w+$/;
var MDN_TYPES = {
  Array: true,
  Object: true,
  JSON: true,
};
var MDN_BASE_URL =
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/';

renderer.codespan = function (text) {
  return '<code>' + decorateCodeSpan(text, this.options) + '</code>';
};

function decorateCodeSpan(text, options) {
  var context = options.context;

  if (
    context.signatures &&
    PARAM_RX.test(text) &&
    context.signatures.some(
      (sig) => sig.params && sig.params.some((param) => param.name === text)
    )
  ) {
    return '<span class="t param">' + text + '</span>';
  }

  var method = METHOD_RX.exec(text);
  if (method) {
    method = method.slice(1).filter(Boolean);
    if (MDN_TYPES[method[0]]) {
      return (
        '<a href="' + MDN_BASE_URL + method.join('/') + '">' + text + '</a>'
      );
    }
    if (
      context.typePath &&
      !arrEndsWith(context.typePath, method) &&
      !arrEndsWith(context.typePath.slice(0, -1), method)
    ) {
      var path = findPath(context, method);
      if (path) {
        var relPath = context.relPath || '';
        return (
          '<a target="_self" href="' +
          relPath +
          '#/' +
          path.slice(1).join('/') +
          '">' +
          text +
          '</a>'
        );
      }
    }
  }

  if (options.highlight) {
    return options.highlight(unescapeCode(text), prism.languages.javascript);
  }

  return text;
}

function arrEndsWith(arr1, arr2) {
  for (var ii = 1; ii <= arr2.length; ii++) {
    if (arr2[arr2.length - ii] !== arr1[arr1.length - ii]) {
      return false;
    }
  }
  return true;
}

function findPath(context, search) {
  var relative = context.typePath;

  for (var ii = 0; ii <= relative.length; ii++) {
    var path = relative.slice(0, relative.length - ii).concat(search);
    if (
      path.reduce(
        (def, name) =>
          def &&
          ((def.module && def.module[name]) ||
            (def.interface &&
              allMembers &&
              allMembers.get(def.interface)[name]) ||
            undefined),
        { module: defs }
      )
    ) {
      return path;
    }
  }
}

function escapeCode(code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescapeCode(code) {
  return code
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function markdown(content, context) {
  context || (context = {});
  return content ? marked(content, { renderer, context }) : content;
}

module.exports = markdown;
