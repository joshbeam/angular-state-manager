var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var fs = require('fs');

gulp.task('scripts', function() {
	return gulp.src([
		'src/state-manager.dependencies.js',
		'src/utils.js',
		'src/State.js',
		'src/StateGroup.js',
		'src/state-manager.js',
		'src/state-manager.module.js',
		'src/state-manager.factory.js'
		])
		.pipe(concat('state-manager.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename('state-manager.min.js'))
		.pipe(uglify())
		.pipe(header('/* angular-state-manager ||| (c) 2015 Joshua Beam ||| github.com/joshbeam ||| joshua.a.beam@gmail.com ||| (MIT) License */'))
		.pipe(gulp.dest('dist'));
});

gulp.task('default',['scripts']);