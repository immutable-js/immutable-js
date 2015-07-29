/**
 *
 *   grunt lint      Lint all source javascript
 *   grunt clean     Clean dist folder
 *   grunt build     Build dist javascript
 *   grunt test      Test dist javascript
 *   grunt default   Lint, Build then Test
 *
 */
module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      options: {
        asi: true,
        curly: false,
        eqeqeq: true,
        esnext: true,
        expr: true,
        forin: true,
        freeze: false,
        immed: true,
        indent: 2,
        iterator: true,
        noarg: true,
        node: true,
        noempty: true,
        nonstandard: true,
        trailing: true,
        undef: true,
        unused: 'vars',
      },
      all: ['src/**/*.js']
    },
    clean: {
      build: ['dist/*']
    },
    bundle: {
      build: {
        files: [{
          src: 'src/Immutable.js',
          dest: 'dist/immutable',
        }, {
          src: 'src/Seq.js',
          dest: 'dist/Seq',
        }, {
          src: 'src/Collection.js',
          dest: 'dist/Collection'
        }, {
          src: 'src/OrderedMap.js',
          dest: 'dist/OrderedMap',
        }, {
          src: 'src/List.js',
          dest: 'dist/List'
        }, {
          src: 'src/Map.js',
          dest: 'dist/Map'
        }, {
          src: 'src/Stack.js',
          dest: 'dist/Stack'
        }, {
          src: 'src/OrderedSet.js',
          dest: 'dist/OrderedSet'
        }, {
          src: 'src/Set.js',
          dest: 'dist/Set'
        }, {
          src: 'src/Record.js',
          dest: 'dist/Record'
        }, {
          src: 'src/Range.js',
          dest: 'dist/Range'
        }, {
          src: 'src/Repeat.js',
          dest: 'dist/Repeat'
        }, {
          src: 'src/is.js',
          dest: 'dist/is'
        }, {
          src: 'src/fromJS.js',
          dest: 'dist/fromJS'
        }, {
          src: 'src/IterableImpl.js',
          dest: 'dist/IterableImpl'
        }]
      }
    },
    copy: {
      build: {
        files: [{
          src: 'type-definitions/Immutable.d.ts',
          dest: 'dist/immutable.d.ts'
        }]
      }
    },
    jest: {
      options: {
        testPathPattern: /.*/
      }
    }
  });


  var fs = require('fs');
  var esperanto = require('esperanto');
  var declassify = require('./resources/declassify');
  var stripCopyright = require('./resources/stripCopyright');
  var uglify = require('uglify-js');
  var Promise = require("bluebird");

  grunt.registerMultiTask('bundle', function () {
    var done = this.async();

    var copyright = fs.readFileSync('resources/COPYRIGHT');
    var es6 = require('es6-transpiler');

    Promise.all(
      this.files.map(function (file) {
        var moduleName = file.src[0].replace(/src\/(.*)\.js/, '$1');

        return esperanto.bundle({
          entry: file.src[0],
          transform: function(source) {
            return declassify(stripCopyright(source));
          }
        }).then(function (bundle) {
          var bundled = bundle.toUmd({
            strict: moduleName !== 'Immutable',
            banner: copyright,
            name: moduleName
          }).code;

          var transformResult = es6.run({
            src: bundled,
            disallowUnknownReferences: false,
            environments: ["node", "browser"],
            globals: {
              define: false,
            },
          });

          if (transformResult.errors && transformResult.errors.length > 0) {
            throw new Error(transformResult.errors[0]);
          }

          var transformed = transformResult.src;

          fs.writeFileSync(file.dest + '.js', transformed);

          var minifyResult = uglify.minify(transformed, {
            fromString: true,
            mangle: {
              toplevel: true
            },
            compress: {
              comparisons: true,
              pure_getters: true,
              unsafe: true
            },
            output: {
              max_line_len: 2048,
            },
            reserved: ['module', 'define', 'Immutable']
          });

          var minified = minifyResult.code;

          fs.writeFileSync(file.dest + '.min.js', copyright + minified);
        });
      })
    ).then(function(){ done(); }, function(error) {
      grunt.log.error(error.stack);
      done(false);
    });
  });


  var exec = require('child_process').exec;

  function execp(cmd) {
    var resolve, reject;
    var promise = new Promise(function(_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });
    try {
      exec(cmd, function (error, out) {
        if (error) {
          reject(error);
        } else {
          resolve(out);
        }
      });
    } catch (error) {
      reject(error);
    }
    return promise;
  }

  grunt.registerTask('stats', function () {
    Promise.all([
      execp('cat dist/immutable.js | wc -c'),
      execp('git show master:dist/immutable.js | wc -c'),
      execp('cat dist/immutable.min.js | wc -c'),
      execp('git show master:dist/immutable.min.js | wc -c'),
      execp('cat dist/immutable.min.js | gzip -c | wc -c'),
      execp('git show master:dist/immutable.min.js | gzip -c | wc -c'),
    ]).then(function (results) {
      return results.map(function (result) { return parseInt(result); });
    }).then(function (results) {
      var rawNew = results[0];
      var rawOld = results[1];
      var minNew = results[2];
      var minOld = results[3];
      var zipNew = results[4];
      var zipOld = results[5];

      function space(n, s) {
        return Array(Math.max(0, 10 + n - (s||'').length)).join(' ') + (s||'');
      }

      function bytes(b) {
        return b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' bytes';
      }

      function diff(n, o) {
        var d = n - o;
        return d === 0 ? '' : d < 0 ? (' ' + bytes(d)).green : (' +' + bytes(d)).red;
      }

      function pct(s, b) {
        var p = Math.floor(10000 * (1 - (s / b))) / 100;
        return (' ' + p + '%').grey;
      }

      console.log('  Raw: ' +
        space(14, bytes(rawNew).cyan) + '       ' + space(15, diff(rawNew, rawOld))
      );
      console.log('  Min: ' +
        space(14, bytes(minNew).cyan) + pct(minNew, rawNew) + space(15, diff(minNew, minOld))
      );
      console.log('  Zip: ' +
        space(14, bytes(zipNew).cyan) + pct(zipNew, rawNew) + space(15, diff(zipNew, zipOld))
      );

    }).then(this.async()).catch(function (error) {
      setTimeout(function () {
        throw error;
      }, 0);
    });
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jest');
  grunt.loadNpmTasks('grunt-release');

  grunt.registerTask('lint', 'Lint all source javascript', ['jshint']);
  grunt.registerTask('build', 'Build distributed javascript', ['clean', 'bundle', 'copy']);
  grunt.registerTask('test', 'Test built javascript', ['jest']);
  grunt.registerTask('default', 'Lint, build and test.', ['lint', 'build', 'stats', 'test']);
}
