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
			baseDir: "dist/"
		},
		port: 9000
	});
});

// Complie sass into CSS
gulp.task('sass', function(){
	return gulp.src('src/sass/main.scss')
		.pipe($.sass({ errLogToConsole: true}))
		.on('error', $.util.log.bind($.util, 'Sass Erorr'))
		.pipe($.autoprefixer({browsers: ['last 1 version']}))
		.pipe(gulp.dest('dist/css'))
		.pipe(reload({stream: true}));
});

// jsHint
gulp.task('jshint', ['jsbeautifier'], function(){
	return gulp.src(['gulpfile.js', 'src/js/**/*.js', '!src/js/bundle.js'])
	.pipe($.jshint())
	.pipe($.jshint.reporter('jshint-stylish'));
});

// jsbeautify
gulp.task('jsbeautify', function(){
	return gulp.src(['src/js/**/*.js'])
		.pipe($.jsbeautifier({config: '.jsbeautifyrc'}))
		.pipe(gulp.dest('src/js'));
});

// copy misc files from src to dist
gulp.task('copy-files', function(){
	return gulp.src(['src/**/*.html'])
		.pipe(gulp.dest('dist'));
});

// Browserify build
var bundler = $.watchify($.browserify('./src/js/site.js',$.watchify.args));

gulp.task('browserify', bundle);
bundler.on('update', bundle);

function bundle(){
	return bundler.bundle()
		.on('error', $.util.log.bind($.util, 'Browserify Error'))
		.pipe($.source('bundle.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(reload({stream: true}));
}

// release build js files
gulp.task('buildjs', function(){

	var b = $.browserify('./src/js/site.js');

	return b.bundle()
		.on('error', $.util.log.bind($.util, 'Browserify Error'))
		.pipe($.source('bundle.js'))
		.pipe($.buffer())
		.pipe($.uglify())
		.pipe(gulp.dest('dist/js/'))
});

// clean dist folder
gulp.task('clean:dist', function(cb){
	return $.del(['dist/'], cb);
});

// reload
gulp.task('reload-sass', ['sass'], function(){
	reload();
});
gulp.task('reload-js', ['browserify', 'jshint'],function(){
	reload();
});
gulp.task('reload-html', ['copy-files'], function(){
	reload();
});

// watch
gulp.task('watch', ['sass', 'browserify'], function(){
	gulp.watch('src/sass/**/*.scss', ['reload-sass']);
	gulp.watch('src/**/*.html', ['reload-html']);
	gulp.watch('src/js/**/*.js', ['reload-js']);
});


/*** tasks to run ***/
// Default task
gulp.task('default', function(cb){
	$.runSequence('clean:dist', 'watch','copy-files', 'server',cb);
});

// Release task
gulp.task('releasebuild');
