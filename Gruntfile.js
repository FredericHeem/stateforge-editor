module.exports = function(grunt) {
   
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'app/**/*.js'
            ]
        },
        clean: {
            development: 'public',
            production: 'dist'
        },
        
        copy: {
            development: {
                files: [
                        {
                            expand: true,
                            cwd: 'app/assets',
                            src: '**',
                            dest: 'public',
                            filter: 'isFile'
                        }
                        ]
            },
            production: {
                files: [
                        {
                            expand: true,
                            cwd: 'app/assets',
                            src: '**',
                            dest: 'dist',
                            filter: 'isFile'
                        }
                        ]
            }
        },

        ejs: {
            options: {
                environment: process.env.NODE_ENV || 'dev'
            },

            'index.html': {
                src: 'app/index.html',
                dest: 'public/index.html'
            }
        },

        stylus: {
            development: {
                options: {
                    'include css': true,
                    'compress': false
                },
                files: {
                    'public/app.css': ['app/styles/index.styl']
                }
            }
        },
        
        concat: {
            development_js: {
                options: {
                    separator: '\n'
                },

                files: {
                    'public/head.js': [
                                       'bower_components/modernizr/modernizr.js'
                                       ],
                    'public/vendor.js': [
                                        'bower_components/jquery/dist/jquery.js',
                                        'bower_components/jquery-ui/jquery-ui.min.js',
                                        'bower_components/qtip2/jquery.qtip.min.js',
                                        'vendor/jquery-drill-down-menu-plugin/js/jquery.cookie.js',
                                        'vendor/jquery-drill-down-menu-plugin/js/jquery.dcdrilldown.1.2.js',
                                        'vendor/jquery.themeswitcher.js'
                                                            ]
                }
            },

            development_css: {
                options: {
                    separator: '\n'
                },

                files: {
                    'public/vendor.css': [
                                          'bower_components/qtip2/jquery.qtip.min.css',
                                          'vendor/jquery-drill-down-menu-plugin/css/dcdrilldown.css',
                                          'vendor/jquery-drill-down-menu-plugin/css/skins/grey.css',
                                          'vendor/jquery-drill-down-menu-plugin/css/skins/demo.css'
                                          ]
                }
            }
        },

        browserify: {
            options: {
                detectGlobals: false,
                transform: ['browserify-ejs']
            },

            development: {
                options: {
                    debug: true
                },

                files: {
                    'public/app.js': 'app/main.js'
                }
            },

            production: {
                files: {
                    'dist/app.js': 'app/main.js'
                }
            }
        },

        uglify: {
            libraries: {
                files: {
                    'dist/head.js': ['public/head.js'],
                    'dist/vendor.js': 'public/vendor.js'
                }
            },

            application: {
                files: {
                    'dist/app.js': 'dist/app.js'
                }
            }
        },

        htmlmin: {
            options: {
                collapseWhitespace: true
            },

            production: {
                files: {
                    'dist/index.html': 'public/index.html'
                }
            }
        },

        cssmin: {
            production: {
                files: {
                    'dist/app.css': 'public/app.css',
                    'dist/vendor.css': 'public/vendor.css'
                }
            }
        },

        connect: {
            options: {
                port: 9000,
                open: true,
                livereload: 35730,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost',
                keepalive: true
            },
            development: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static('public'),
                            connect.static('browser/dist')
                        ];
                    }
                }
            },
            production: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static('dist'),
                        ];
                    }
                }
            },
            dist: {
                options: {
                    base: '<%= config.dist %>',
                    livereload: false
                }
            }
        },

        watch: {
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['browserify:development']
            },
            
            modules: {
                files: ['app/**/*', 'lib/**/*'],
                tasks: 'browserify:development'
            },
/*
            livereload: {
                options: {
                },

                files: [
                        'public/*.js',
                        'public/*.css'
                        ]
            }
            */
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },

            serve: ['watch', 'connect:development']
        },
        'ftp-deploy': {
            build: {
                auth: {
                    host: 'ftp.stateforge.com',
                    port: 21,
                    authKey: 'key1'
                },
                src: 'dist',
                dest: '/StateMachineDiagram',
                exclusions: ['**/.DS_Store']
            }
        }
    })
   
        // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.registerTask('development',
            [
             'ejs',
             'copy:development',
             'stylus',
             'concat',
             'browserify:development'
             ]
    )

    grunt.registerTask('production',
            [
             'ejs',
             'copy:production',
             'stylus',
             'concat',
             'browserify:production',
             'uglify',
             'htmlmin',
             'cssmin'
             ]
    )
    grunt.registerTask('serve_prod', ['production', 'connect:production'])
    grunt.registerTask('serve', ['development', 'concurrent:serve'])
    grunt.registerTask('default', ['development'])
}
