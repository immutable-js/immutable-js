var { Seq } = require('immutable');
var marked = require('marked');
var prism = require('./prism');

function markdownDocs(defs) {
  markdownTypes(defs, []);

  function markdownTypes(typeDefs, path) {
    Seq(typeDefs).forEach((typeDef, typeName) => {
      var typePath = path.concat(typeName);
      markdownDoc(typeDef.doc, { defs, typePath });
      typeDef.call && markdownDoc(typeDef.call.doc, { defs, typePath });
      if (typeDef.interface) {
        markdownDoc(typeDef.interface.doc, { defs, typePath });
        Seq(typeDef.interface.groups).forEach(group =>
          Seq(group.members).forEach((member, memberName) =>
            markdownDoc(
              member.doc,
              { defs, typePath: typePath.concat(memberName.slice(1)) }
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

// functions come before keywords
prism.languages.insertBefore('javascript', 'keyword', {
  'block-keyword': /\b(if|else|while|for|function)\b/g,
  'function': prism.languages.function
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

var METHOD_RX = /^(\w+)[#.](\w+)$/;
var MDN_BASE_URL =
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/';

renderer.codespan = function(text) {
  var method = METHOD_RX.exec(text);
  if (method) {
    if (method[1] === 'Array' || method[1] === 'Object') {
      text = '<a href="'+MDN_BASE_URL+method[1]+'/'+method[2]+'">'+text+'</a>';
    }
  }
  return '<code>' + text + '</code>';
};

function escapeCode(code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdown(content, context) {
  // `\w+(\.|#)\w+`
  return content ? marked(content, { renderer, context }) : content;
}

module.exports = markdownDocs;
