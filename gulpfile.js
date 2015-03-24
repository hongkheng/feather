/** gulp build **/
"use strict";

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
	pattern: '*',
	rename: {
		'vinyl-source-stream': 'source',
		'vinyl-buffer': 'buffer'
	}
}); // Load all gulp and non-gulp plugins
var reload = $.browserSync.reload;

// Static server
gulp.task('server', function(){
	$.browserSync({
		server: {
			baseDir: "src/"
		},
		port: 9000
	});
});

// Complie sass into CSS
gulp.task('sass', function(){
	return gulp.src('src/sass/main.scss')
		.pipe($.sass())
		.pipe(gulp.dest('src/css'))
		.pipe(reload({stream: true}));
});

// jsHint
gulp.task('jshint', function(){
	return gulp.src(['gulpfile.js', 'src/js/**/*.js', '!src/js/bundle.js'])
	.pipe($.jshint())
	.pipe($.jshint.reporter('jshint-stylish'));
});

// Browserify build
var bundler = $.watchify($.browserify('./src/js/site.js',$.watchify.args));

gulp.task('browserify', bundle);
bundler.on('update', bundle);

function bundle(){
	return bundler.bundle()
		.on('error', $.util.log.bind($.util, 'Browserify Error'))
		.pipe($.source('bundle.js'))
		.pipe(gulp.dest('src/js'))
		.pipe(reload({stream: true}));
}

// reload
gulp.task('reload-sass', ['sass'], function(){
	reload();
});
gulp.task('reload-js', ['browserify'],function(){
	reload();
});

// watch
gulp.task('watch', ['sass', 'browserify', 'server'], function(){
	gulp.watch('src/sass/**/*.scss', ['reload-sass']);
	gulp.watch('src/*.html').on('change', reload);
	gulp.watch('src/js/*.js', ['jshint','reload-js']);
});


/*** tasks to run ***/
// Default task
gulp.task('default', ['watch']);

// gulp : for development and livereload

