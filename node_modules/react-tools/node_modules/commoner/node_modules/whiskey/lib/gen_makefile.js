var path = require('path');
var fs = require('fs');

var async = require('async');
var sprintf = require('sprintf').sprintf;
var templates = require('magic-templates');
templates.setTemplatesDir(path.join(__dirname, '../assets/'));
templates.setDebug(false);

/**
 * Generate and write a Makefile with Whiskey related targets.
 * @param {Array} testFiles Test files.
 * @param {String} targetPath path where a generated Makefile is saved.
 * @param {Function} callback Callback called with (err).
 */
function generateMakefile(testFiles, targetPath, callback) {
  var template = new templates.Template('Makefile.magic');
  var fullPath = path.join(targetPath, 'Makefile');
  var context = {
    test_files: testFiles.join(' \\\n ')
  };

  if (path.existsSync(fullPath)) {
    callback(new Error(sprintf('File "%s" already exists', fullPath)));
    return;
  }

  async.waterfall([
    template.load.bind(template),

    function render(template, callback) {
      template.render(context, callback);
    },

    function save(output, callback) {
      fs.writeFile(fullPath, output.join(''), callback);
    }
  ], callback);
}

exports.generateMakefile = generateMakefile;
