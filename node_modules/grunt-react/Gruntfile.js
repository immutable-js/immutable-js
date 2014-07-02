/*
 * grunt-react
 * https://github.com/ericclemmons/grunt-react
 *
 * Copyright (c) 2013 Eric Clemmons, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      },
    },

    // Used for testing the transformer
    browserify: {
      options: {
        transform: [ require('./main').browserify ]
      },
      module: {
        src: 'test/fixtures/browserify/module.jsx',
        dest: 'tmp/browserify/module.js'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    react: {
      single_js_files: {
        files: {
          'tmp/js/fixture.js': 'test/fixtures/js/fixture.js',
          'tmp/js/fixture-jsx.js': 'test/fixtures/js/fixture-jsx.js'
        }
      },
      single_jsx_files: {
        files: {
          'tmp/jsx/fixture.js': 'test/fixtures/jsx/fixture.jsx',
          'tmp/jsx/nested/fixture-js.js': 'test/fixtures/jsx/nested/fixture-js.jsx'
        }
      },
      multiple_jsx_files: {
        files: {
          'tmp/multiple_jsx_files.js': ['test/fixtures/jsx/fixture.jsx', 'test/fixtures/jsx/nested/fixture-js.jsx']
        }
      },
      dynamic_mappings: {
        files: [
          {
            expand: true,
            cwd: 'test/fixtures',
            src: ['**/*.js'],
            dest: 'tmp/dynamic_mappings/js',
            ext: '.js'
          },
          {
            expand: true,
            cwd: 'test/fixtures',
            src: ['**/*.jsx'],
            dest: 'tmp/dynamic_mappings/jsx',
            ext: '.js'
          }
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'react', 'browserify', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
