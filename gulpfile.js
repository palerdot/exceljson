'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('scss', function() {
    return gulp.src('./styles.scss/**/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('scss:watch', function() {
    gulp.watch('./styles.scss/**/*.scss', ['scss']);
});
