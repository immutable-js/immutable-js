var markdownDocs = require('./markdownDocs');
var defs = require('../resources/immutable.d.json');
markdownDocs(defs);

module.exports = defs;
