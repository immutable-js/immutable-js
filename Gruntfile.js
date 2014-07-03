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
    }
  });

  grunt.registerTask('jest', function() {
    var onCompleteTask = this.async();
    require('jest-cli').runCLI(null, __dirname, function (completionData) {
      onCompleteTask(completionData.numFailedTests === 0);
    });
  });

  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['react', 'copy', 'jest']);
}
