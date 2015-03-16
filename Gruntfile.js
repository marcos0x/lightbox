/*!
 * Lightbox Gruntfile
 * Copyright 2015 Marcos Ávila
 * marcos0x@gmail.com
 */

module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  var fs = require('fs');
  var path = require('path');
  var configBridge = grunt.file.readJSON('./src/grunt/configBridge.json', { encoding: 'utf8' });

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    jqueryCheck: configBridge.config.jqueryCheck.join('\n'),
    jqueryVersionCheck: configBridge.config.jqueryVersionCheck.join('\n'),

    // Task configuration.
    jshint: {
      options: {
        jshintrc: 'src/js/.jshintrc'
      },
      grunt: {
        options: {
          jshintrc: 'src/grunt/.jshintrc'
        },
        src: ['Gruntfile.js', 'src/grunt/*.js']
      },
      main: {
        src: 'src/js/*.js'
      },
    },

    jscs: {
      options: {
        config: 'src/js/.jscsrc'
      },
      grunt: {
        src: '<%= jshint.grunt.src %>'
      },
      main: {
        src: '<%= jshint.main.src %>'
      }
    },

    concat: {
      main: {
        src: [
          'src/js/jquery.lightbox.js'
        ],
        dest: 'dist/jquery.lightbox.js'
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      main: {
        src: '<%= concat.main.dest %>',
        dest: 'dist/jquery.lightbox.min.js'
      }
    },

    autoprefixer: {
      options: {
        browsers: configBridge.config.autoprefixerBrowsers
      },
      main: {
        options: {
          map: false
        },
        src: 'dist/jquery.lightbox.css'
      }
    },

    csslint: {
      options: {
        csslintrc: 'src/css/.csslintrc'
      },
      main: [
        'dist/jquery.lightbox.css'
      ]
    },

    cssmin: {
      options: {
        // TODO: disable `zeroUnits` optimization once clean-css 3.2 is released
        //    and then simplify the fix for https://github.com/twbs/bootstrap/issues/14837 accordingly
        compatibility: 'ie8',
        keepSpecialComments: '*',
        advanced: false
      },
      minifyMain: {
        src: 'dist/jquery.lightbox.css',
        dest: 'dist/jquery.lightbox.min.css'
      }
    },

    csscomb: {
      options: {
        config: 'src/css/.csscomb.json'
      },
      main: {
        expand: true,
        cwd: 'dist/',
        src: ['*.css', '!*.min.css'],
        dest: 'dist/'
      }
    },

    watch: {
      options: {
        livereload: true
      },
      jsMain: {
        files: ['<%= jshint.main.src %>'],
        tasks: ['dist-js']
      },
      cssMain: {
        files: ['src/**/*.css'],
        tasks: ['dist-css']
      }
    },

    exec: {
      npmUpdate: {
        command: 'npm update'
      }
    }

  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  require('time-grunt')(grunt);

  var isUndefOrNonZero = function (val) {
    return val === undefined || val !== '0';
  };

  // JS distribution task.
  grunt.registerTask('dist-js', [
    'concat:main', 
    'uglify:main', 
  ]);

  grunt.registerTask('dist-css', [
    'autoprefixer:main', 
    'csscomb:main', 
    'cssmin:minifyMain', 
  ]);

  // Full distribution task.
  grunt.registerTask('dist', ['dist-css', 'dist-js']);

};
