module.exports = function(grunt) {
  grunt.initConfig({
    react: {
      options: {
        harmony: true
      },
      build: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: ['**/*.js'],
            dest: 'build/'
          }
        ]
      }
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'types',
            src: ['**/*.d.ts'],
            dest: 'build/'
          },
        ]
      }
    },
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
    }
  });

  grunt.registerTask('jest', function() {
    var onCompleteTask = this.async();
    require('jest-cli').runCLI(null, __dirname, function (completionData) {
      onCompleteTask(completionData.numFailedTests === 0);
    });
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['jshint', 'react', 'copy', 'jest']);
}
