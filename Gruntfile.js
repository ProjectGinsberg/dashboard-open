'use strict'; 

module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON("package.json"),

		clean: ['target'],

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Copying static resource and source files (for debugging purposes...)
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		copy: {
			// Dashboard source files
			sources: {
				expand: true,
				src: ['src/js/**'],
				dest: 'target/js'
			},
			lib: {
				expand: true,
				src: ['lib/**/**.js'],
				dest: 'target/js'
			},
			// Static resources
			static: {
				expand: true,
				cwd: 'src/static/',
				src: ['**'],
				dest: 'target/',
				options: {
					noProcess: ['**/**', '!**/*.html'], // Only do this to HTML files
					process: function(content, srcpath) {
						if (srcpath.indexOf('.html') == -1) return content;
						return grunt.template.process(content);
					}
				}
			},
		},
		jasmine : {
	      // Your project's source files
	      src : 'src/**/*.js',
	      // Your Jasmine spec files
	      specs : 'test/unit/*spec.js',
	      // Your spec helper files
	      helpers : 'test/helpers/*.js'
	    },
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// A little hack to fix up uglification targets
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		rename: {
			move_minified_source: {
				expand: true,
				src: ['*.min.js'],
				dest: 'target/js'
			},
			move_source_map: {
				expand: true,
				src: ['*.map'],
				dest: 'target/js'
			}
		},

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// SASS CSS definitions
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		sass: {
			dashboard: {
				options: {
					style: 'compressed'
				},
				files: {
					'target/stylesheets/dashboard-<%= gitinfo.local.branch.current.SHA %>.css': 'src/js/modules/main.sass'
				}
			}
		},
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Combine and minify angular templates
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		ngtemplates: {
			fixme_remove_these: {
				cwd: 'src/html',
				src: '**/**.html',
				dest: 'target/js/templates-<%= gitinfo.local.branch.current.SHA %>.js',
				options: {
					module: 'gb.dashboard',
					prefix: '/app/partials/',
					htmlmin: {
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						removeAttributeQuotes: true,
						removeComments: true, // Only if you don't use comment directives!
						removeEmptyAttributes: true,
						removeRedundantAttributes: true,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true
					}
				}
			},
			dashboard: {
				cwd: 'src/js/modules',
				src: '**/**.html',
				dest: 'target/js/dashboard-templates-<%= gitinfo.local.branch.current.SHA %>.js',
				options: {
					module: 'gb.dashboard',
					prefix: '/templates/',
					htmlmin: {
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						removeAttributeQuotes: true,
						removeComments: true, // Only if you don't use comment directives!
						removeEmptyAttributes: true,
						removeRedundantAttributes: true,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true
					}
				}

			}
		},

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Combine and minify the Javascripts
		// This is split into two blocks because the vendor stuff takes a while to process
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		uglify: {
			dashboard: {
				options: {
					sourceMap: true,
					mangle: true,
					sourceMapIncludeSources: false
				},
				files: {
					'dashboard-<%= gitinfo.local.branch.current.SHA %>.min.js': [
						'src/js/app.js',

						//<!-- SERVICES -->
						'src/js/services.js',
						'src/js/services/Modal.js',
						'src/js/services/Wellbeing.js',
						'src/js/services/WellbeingMeasures.js',
						'src/js/services/Exercise.js',
						'src/js/services/StepCount.js',
						'src/js/services/Correlations.js',
						'src/js/services/Survey.js',

						//<!-- CONTROLLERS -->
						'src/js/controllers.js',
						'src/js/controllers/AppCtrl.js',
						'src/js/controllers/RecentActivityCtrl.js',
						'src/js/controllers/DeleteObjectiveCtrl.js',
						'src/js/controllers/WhoFiveCtrl.js',
						'src/js/controllers/SurveyResultsCtrl.js',

						'src/js/controllers/tracker/AlcoholCtrl.js',
						'src/js/controllers/tracker/NutritionCtrl.js',
						'src/js/controllers/tracker/SleepCtrl.js',
						'src/js/controllers/tracker/ExerciseCtrl.js',
						'src/js/controllers/tracker/StepCtrl.js',

						'src/js/filters.js',
						'src/js/directives.js',

						'src/js/directives/gbRollingAverageGraph.js',
						'src/js/directives/gbMonthByMonthChangeGraph.js',
						'src/js/directives/gbAverageComparisonHistogram.js',
						'src/js/directives/gbTagsVsQualityOfSleep.js',
						'src/js/directives/gbSurveyResultsGraph.js',
						'src/js/directives/gbSparkline.js',

						//<!-- MODULARISED -->
						'src/js/modules/**/**.js',
					]
				}
			},
			vendor: {
				options: {
					sourceMap: true,
					mangle: false, // In general this doesn't play nicely with vendor libs
					sourceMapIncludeSources: false,
				},
				files: {
					'vendor-<%= gitinfo.local.branch.current.SHA %>.min.js': [
						'lib/jquery-1.9.1.min.js',
						'lib/angular/angular.js',
						'lib/angular/angular-route.js',
						'lib/angular/angular-animate.js',
						'lib/angular/angular-resource.js',
						'lib/angular/angular-cookies.js',
						'lib/angulartics/angulartics.js',
						'lib/angulartics/angulartics-ga.js',
						'lib/angulartics/angulartics-localytics.js',
						'lib/pushy/modernizr-2.6.2.min.js', // Used in NutritionCtrl and possible elsewhere
						'lib/pushy/pushy.min.js',
						'lib/moment/moment.min.js',
						'lib/d3.v3.js',
						'lib/hopscotch-0.2.2.js',
						'lib/rangy/rangy-core.js',
						'lib/rangy/rangy-textrange.js',
						'lib/angular-local-storage-0.0.5/angular-local-storage.min.js',
						'lib/source-map-0.1.38.js',
						'lib/underscore/underscore-min.js',
						'lib/bootstrap/js/bootstrap.min.js',
						'lib/angular-rollbar.js',
						'lib/localytics.js'
					],
				}
			}
		},

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Target for developers: monitors the filesystem and builds automagically
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		watch: {
			options: {
				livereload: true
			},
			gruntfile: {
			    files: [ 'Gruntfile.js'],
			    options: {
			      reload: true
				}
			},
			git: {
				// If the current HEAD changes we need to do a full rebuild
				files: ['.git/refs/heads/**'],
				tasks: ['build']
			},
			sass: {
				files: ['src/**/**.sass'],
				tasks: ['gitinfo', 'sass']
			},
			scripts: {
				files: ['src/js/**'],
				tasks: ['gitinfo', 'uglify:dashboard', 'rename', 'copy:sources']
			},
			templates: {
				files: ['src/**/**.html'],
				tasks: ['gitinfo', 'ngtemplates']
			},
			static: {
				files: ['src/static/**'],
				tasks: ['gitinfo', 'copy:static']
			},
		},

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Minimalistic HTTP server for us in development
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		'http-server': {
			'dev': {

				// the server root directory
				root: 'target',
				port: 5000,
				host: "127.0.0.1",
				cache: 0,
				showDir: true,
				autoIndex: true,
				defaultExt: "html",

				// run in parallel with other tasks
				runInBackground: true,

			}
		},

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Utility target to annotate angular components with explicit dependencies.
		// Needs to be run manually.
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		'ngAnnotate': {
			dashboard: {
				files: [{
					expand: true,
					src: ['src/js/**/**.js']
				}]
			}
		},

		'protractor': {
			options: {
				configFile: "node_modules/protractor/referenceConf.js", // Default config file
				keepAlive: true, // If false, the grunt process stops when the test fails.
				noColor: false, // If true, protractor will not use colors in its output.
				args: {
					// Arguments passed to the command
				}
			},
			e2e: { // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
				options: {
					configFile: "test/e2e/protractor.conf.js", // Target-specific config file
					args: {} // Target-specific arguments
				}
			},
		},

	});

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Load plugins
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-rename');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-http-server');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-protractor-runner');
	grunt.loadNpmTasks('grunt-gitinfo');

	grunt.loadNpmTasks('grunt-contrib-jasmine');


	// Default task, defined below
	grunt.registerTask('default', 'dev');

	// For developers -- build continuously and run a webserver
	grunt.registerTask('dev', ['build', 'http-server', 'watch']);

	// Create a full distribution in target
	grunt.registerTask('build', [
		'clean', 'gitinfo', 'copy:static', 'sass', 'ngtemplates',
		'uglify:dashboard', 'rename', //'copy:sources',
		'uglify:vendor', 'rename', 'copy:lib',
	]);

	// For developers -- run the protractor e2e tests
	grunt.registerTask('test', ['protractor'])

	// For Jenkins, build, run a local server, run tests
	grunt.registerTask('jenkins', ['build', 'http-server', 'test']);

	grunt.task.run(['gitinfo']);
}
