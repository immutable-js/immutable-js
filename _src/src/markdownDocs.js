var { Seq } = require('immutable');
var marked = require('marked');
var prism = require('./prism');
var collectMemberGroups = require('./collectMemberGroups');

function markdownDocs(defs) {
  collectAllMembersForAllTypes(defs);
  markdownTypes(defs, []);

  function markdownTypes(typeDefs, path) {
    Seq(typeDefs).forEach((typeDef, typeName) => {
      var typePath = path.concat(typeName);
      markdownDoc(
        typeDef.doc,
        { defs, typePath }
      );
      typeDef.call && markdownDoc(
        typeDef.call.doc,
        { defs,
          typePath,
          signatures: typeDef.call.signatures }
      );
      if (typeDef.interface) {
        markdownDoc(typeDef.interface.doc, { defs, typePath });
        Seq(typeDef.interface.groups).forEach(group =>
          Seq(group.members).forEach((member, memberName) =>
            markdownDoc(
              member.doc,
              { defs,
                typePath: typePath.concat(memberName.slice(1)),
                signatures: member.signatures }
            )
          )
        );
      }
      typeDef.module && markdownTypes(typeDef.module, typePath);
    });
  }
}

function markdownDoc(doc, context) {
  if (!doc) {
    return;
  }
  doc.synopsis && (doc.synopsis = markdown(doc.synopsis, context));
  doc.description && (doc.description = markdown(doc.description, context));
  doc.notes && doc.notes.forEach(note => {
    if (note.name !== 'alias') {
      note.body = markdown(note.body, context);
    }
  });
}

function collectAllMembersForAllTypes(defs) {
  Seq(defs).forEach((def, name) => {
    if (def.interface) {
      var groups = collectMemberGroups(def.interface, { showInherited: true });
      def.interface.allMembers = Seq.Keyed(groups[''].map(
        member => [member.memberName, member.memberDef]
      )).toObject();
    }
    if (def.module) {
      collectAllMembersForAllTypes(def.module);
    }
  });
}

// functions come before keywords
prism.languages.insertBefore('javascript', 'keyword', {
  'var': /\b(this)\b/g,
  'block-keyword': /\b(if|else|while|for|function)\b/g,
  'primitive': /\b(true|false|null|undefined)\b/g,
  'function': prism.languages.function,
});

prism.languages.insertBefore('javascript', {
  'qualifier': /\b[A-Z][a-z0-9_]+/g,
});

marked.setOptions({
  xhtml: true,
  highlight: code => prism.highlight(code, prism.languages.javascript)
});

var renderer = new marked.Renderer();

renderer.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }
  return '<code class="codeBlock">' +
    (escaped ? code : escapeCode(code, true)) +
  '</code>';
};

var METHOD_RX = /^(\w+)(?:[#.](\w+))?(?:\(\))?$/;
var PARAM_RX = /^\w+$/;
var MDN_TYPES = {
  'Array': true,
  'Object': true,
  'JSON': true,
};
var MDN_BASE_URL =
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/';

renderer.codespan = function(text) {
  return '<code>' + decorateCodeSpan(text, this.options) + '</code>';
};

function decorateCodeSpan(text, options) {
  var context = options.context;

  if (context.signatures &&
      PARAM_RX.test(text) &&
      context.signatures.some(sig =>
        sig.params && sig.params.some(param => param.name === text))) {
    return '<span class="t param">' + text + '</span>';
  }

  var method = METHOD_RX.exec(text);
  if (method) {
    method = method.slice(1).filter(function(x){return !!x});
    if (MDN_TYPES[method[0]]) {
      return '<a href="'+MDN_BASE_URL+method.join('/')+'">'+text+'</a>';
    }
    if (!arrEndsWith(context.typePath, method) &&
        !arrEndsWith(context.typePath.slice(0, -1), method)) {
      var path = findPath(
        context.defs,
        context.typePath,
        method
      );
      if (path) {
        return '<a target="_self" href="#/'+path.slice(1).join('/')+'">'+text+'</a>';
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

function findPath(defs, relative, search) {
  for (var ii = 0; ii <= relative.length; ii++) {
    var path = relative.slice(0, relative.length - ii).concat(search);
    if (path.reduce(
      (def, name) => def && (
        (def.module && def.module[name]) ||
        (def.interface && def.interface.allMembers[name]) ||
        undefined
      ),
      {module: defs}
    )) {
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
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&');
}

function markdown(content, context) {
  return content ? marked(content, { renderer, context }) : content;
}

module.exports = markdownDocs;
