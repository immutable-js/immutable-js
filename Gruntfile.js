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
        eqnull: true,
        esnext: true,
        expr: true,
        forin: true,
        freeze: true,
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
    smash: {
      build: {
        files: [{
          src: 'src/Immutable.js',
          dest: 'dist/Immutable'
        }]
      }
    },
    copy: {
      build: {
        files: [{
          expand: true,
          cwd: 'type-definitions',
          src: ['**/*.d.ts'],
          dest: 'dist/'
        }]
      }
    },
    jest: {
      options: {
        testPathPattern: /.*/
      }
    },
    stats: {
      build: {}
    }
  });


  var fs = require('fs');
  var smash = require('smash');
  var traceur = require('traceur');
  var uglify = require('uglify-js');

  grunt.registerMultiTask('smash', function () {
    var done = this.async();
    this.files.map(function (file) {
      var unTransformed = '';
      smash(file.src).on('data', function (data) {
        unTransformed += data;
      }).on('end', function () {
        var transformed = traceur.compile(unTransformed, {
          filename: file.src[0]
        });
        if (transformed.error) {
          throw transformed.error;
        }
        var transformed = fs.readFileSync('resources/traceur-runtime.js', {encoding: 'utf8'}) + transformed.js;
        var wrapped = fs.readFileSync('resources/universal-module.js', {encoding: 'utf8'})
          .replace('%MODULE%', transformed);

        var copyright = fs.readFileSync('resources/COPYRIGHT');

        fs.writeFileSync(file.dest + '.js', copyright + wrapped);

        var result = uglify.minify(wrapped, {
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

        fs.writeFileSync(file.dest + '.min.js', copyright + result.code);
        done();
      });
    });
  });


  var exec = require('child_process').exec;

  grunt.registerMultiTask('stats', function () {
    var done = this.async();
    exec('cat dist/Immutable.js | wc -c', function (error, out) {
      if (error) throw new Error(error);
      var rawBytes = parseInt(out);
      console.log('     Concatenated: ' +
        (rawBytes + ' bytes').cyan);
      exec('gzip -c dist/Immutable.js | wc -c', function (error, out) {
        if (error) throw new Error(error);
        var zippedBytes = parseInt(out);
        var pctOfA = Math.floor(10000 * (1 - (zippedBytes / rawBytes))) / 100;
        console.log('       Compressed: ' +
          (zippedBytes + ' bytes').cyan + ' ' +
          (pctOfA + '%').green);
        exec('cat dist/Immutable.min.js | wc -c', function (error, out) {
          if (error) throw new Error(error);
          var minifiedBytes = parseInt(out);
          var pctOfA = Math.floor(10000 * (1 - (minifiedBytes / rawBytes))) / 100;
          console.log('         Minified: ' +
            (minifiedBytes + ' bytes').cyan + ' ' +
            (pctOfA + '%').green);
          exec('gzip -c dist/Immutable.min.js | wc -c', function (error, out) {
            if (error) throw new Error(error);
            var zippedMinBytes = parseInt(out);
            var pctOfA = Math.floor(10000 * (1 - (zippedMinBytes / rawBytes))) / 100;
            console.log('  Min\'d & Cmprs\'d: ' +
              (zippedMinBytes + ' bytes').cyan + ' ' +
              (pctOfA + '%').green);
            done();
          })
        })
      })
    })
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jest');
  grunt.loadNpmTasks('grunt-release');

  grunt.registerTask('lint', 'Lint all source javascript', ['jshint']);
  grunt.registerTask('build', 'Build distributed javascript', ['clean', 'smash', 'copy']);
  grunt.registerTask('test', 'Test built javascript', ['jest']);
  grunt.registerTask('default', 'Lint, build and test.', ['lint', 'build', 'stats', 'test']);
}
