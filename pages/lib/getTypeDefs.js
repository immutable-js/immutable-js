var markdownDocs = require('./markdownDocs');
var defs = require('../generated/immutable.d.json');

markdownDocs(defs);

module.exports = defs;
