/*
 * grunt-react
 * https://github.com/ericclemmons/grunt-react
 *
 * Copyright (c) 2013 Eric Clemmons, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var transform = require('react-tools').transform;

  grunt.registerMultiTask('react', 'Compile Facebook React JSX templates into JavaScript', function() {
    var done = this.async();

    var options = this.options();
    grunt.verbose.writeflags(options, 'Options');

    if (this.files.length < 1) {
      grunt.verbose.warn('Destination not written because no source files were provided.');
    }

    grunt.util.async.forEachSeries(this.files, function(f, nextFileObj) {
      var destFile = f.dest;

      var files = f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      if (files.length === 0) {
        if (f.src.length < 1) {
          grunt.log.warn('Destination not written because no source files were found.');
        }

        // No src files, go to next target. Warn would have been issued above.
        return nextFileObj();
      }

      var compiled = [];
      grunt.util.async.concatSeries(files, function(file, next) {
        grunt.log.writeln('[react] Compiling ' + file.cyan + ' --> ' + destFile.cyan);

        try {
          compiled.push(transform(grunt.file.read(file), options));
          next();
        } catch (e) {
          grunt.event.emit('react.error', file, e);
          grunt.fail.warn(e);
        }
      }, function () {
        grunt.file.write(destFile, compiled.join(grunt.util.normalizelf(grunt.util.linefeed)));
        grunt.log.writeln('[react] File ' + destFile.cyan + ' created.');
        nextFileObj();
      });

    }, done);
  });
};
