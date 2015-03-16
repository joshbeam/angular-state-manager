var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('scripts', function() {
	return gulp.src('src/*.js')
		.pipe(concat('state-manager.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename('state-manager.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('default',['scripts']);