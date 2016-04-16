require('node-jsx').install({harmony: true});
var markdown = require('./markdown');
var defs = require('./getTypeDefs');


function genMarkdownDoc(typeDefSource) {
  return markdown(
    typeDefSource.replace(/\n[^\n]+?travis-ci.org[^\n]+?\n/, '\n'),
    {
      defs,
      typePath: ['Immutable'],
      relPath: 'docs/'
    }
  );
}

module.exports = genMarkdownDoc;
