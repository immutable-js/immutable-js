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
            dest: 'build/',
          }
        ]
      }
    },
  });

  grunt.loadNpmTasks('grunt-react');

  grunt.registerTask('default', ['react']);
}
