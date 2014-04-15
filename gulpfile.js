var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var rename = require('gulp-rename');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');

gulp.task('default', ['js', 'css', 'copy'], function () {})
    .task('js', function () {
        return gulp.src(['lib/paginator.js', 'lib/presentations.js'])
            .pipe(jshint())
            .pipe(jshint.reporter(jshintStylish))
            .pipe(uglify())
            .pipe(rename(function (path) {
                path.extname = '.min.js';
            }))
            .pipe(gulp.dest('build/'));
    })
    .task('css', function () {
        return gulp.src('lib/presentations.css')
            .pipe(csso())
            .pipe(rename(function (path) {
                path.extname = '.min.css';
            }))
            .pipe(gulp.dest('build/'));
    })
    .task('copy', function () {
        return gulp.src('bower_components/normalize.css/normalize.css')
            .pipe(gulp.dest('demo/css/'));
    });