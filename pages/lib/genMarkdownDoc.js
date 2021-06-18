var markdown = require('./markdown');
var defs = require('./getTypeDefs');

function genMarkdownDoc(typeDefSource) {
  return markdown(
    typeDefSource.replace(/\n[^\n]+?Build Status[^\n]+?\n/, '\n'),
    {
      defs,
      typePath: ['Immutable'],
      relPath: 'docs/',
    }
  );
}

module.exports = genMarkdownDoc;
