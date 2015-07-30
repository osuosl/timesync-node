module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      js: {
        files: [
          'src/*.js'
        ],
        tasks: ['develop'],
        options: { nospawn: true }
      }
    },
    develop: {
      server: {
        file: 'src/app.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-develop');

  grunt.registerTask('default', ['develop', 'watch']);

};