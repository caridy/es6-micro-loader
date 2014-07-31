module.exports = function (grunt) {

    var libpath = require('path');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['server.js', 'client.js', 'tests/*.js']
        },
        copy: {
            dist: {
                files: [
                    {
                        'dist/loader.js': ['client.js']
                    }
                ]
            }
        },
        uglify: {
            dist: {
                files: [
                    {
                        'dist/loader.min.js': ['dist/loader.js']
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', ['copy', 'uglify']);
    grunt.registerTask('default', ['jshint', 'build']);
};
