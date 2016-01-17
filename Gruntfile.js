module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                node: true,
                newcap: false
            },
            all: {
                src:[
                    'lib/routes/**/*',
                    'config/**/*',
                    'lib/connectors/**/*',
                    'lib/loader/**/*',
                    'lib/logger/**/*',
                    'lib/routes/**/*',
                    'lib/schemas/**/*',
                    'lib/services/**/*',
                    'lib/iad-logging.js'
                ]
            }
        },
        jasmine_node: {
            options: {
                //coverage: {

                //}
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'spec',
                noStack: false,
                junitreport: {
                    report: true,
                    savePath : './test/build/reports/jasmine/',
                    useDotNotation: true,
                    consolidate: true
                }
            },
            all: ['test/']
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: true
                },
                src: ['test/e2erefac/**/*.spec.js']
            }
        },
        apidoc: {
            myapp: {
                src: "lib/",
                dest: "apidoc/"
            }
        }
    });

    process.on('uncaughtException', function (e) {
       grunt.log.error('Caught unhandled exception: ' + e.toString());
       grunt.log.error(e.stack);
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['mochaTest']);

    grunt.registerTask('doc', ['apidoc']);
};