module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n'
			},
			build: {
				src: [
					'lib/seedrandom.js',
					'src/header.js',
					'src/Myd/*.js',
					'src/footer.js'
				],
				dest: '<%= pkg.name %>-<%= pkg.version %>.js'
			}
		},
		min: {
			build: {
				src: ['<%= pkg.name %>-<%= pkg.version %>.js'],
				dest: '<%= pkg.name %>-<%= pkg.version %>.min.js'
			}
		},
		watch: {
			files: ['src/**/*', 'lib/**/*'],
			tasks: ['jshint', 'concat']
		},
		jshint: {
			files: ['src/Myd/*.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-yui-compressor');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['jshint', 'concat', 'min']);

};
