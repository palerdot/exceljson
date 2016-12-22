'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var webpack = require('webpack-stream');

gulp.task('webpack', function() {
    return gulp.src('./index.js')
        .pipe( webpack( require('./webpack.config.js') ) )
        .pipe(gulp.dest('dist/'));
});

gulp.task('scss', function() {
    return gulp.src('./styles.scss/**/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('scss:watch', function() {
    gulp.watch('./styles.scss/**/*.scss', ['scss']);
});
