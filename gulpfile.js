var riot = require('gulp-riot');
var gulp = require('gulp');
var concat = require("gulp-concat");
var less = require('gulp-less');
var rollup = require('gulp-rollup');
var sourcemaps = require("gulp-sourcemaps");
var through = require('through2');
var uglify = require('gulp-uglify');
var util = require('gulp-util');

gulp.task('build-js', function () {
  return gulp.src(["*.js",".dist/_tags.js"])
    .pipe(sourcemaps.init())
    .pipe(concat('unrest.js'))
    //.pipe(uglify({mangle: false, compress: false}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(".dist/"));
});
gulp.task('build-tag', function() {
  return gulp.src("*.tag")
    .pipe(riot())
    .pipe(concat("_tags.js"))
    .pipe(gulp.dest(".dist"));
});

gulp.task('build-css', function () {
  return gulp.src(["less/base.less", ])//"static/bfish/**/*.less"])
    .pipe(less({}))
    .pipe(concat('unrest.css'))
    .pipe(gulp.dest(".dist/"));
});

var build_tasks = ['build-tag', 'build-js', 'build-css'];

gulp.task('watch', build_tasks, function () {
  gulp.watch("*.js", ['build-tag','build-js']);
  gulp.watch("*.tag", ['build-tag','build-js']);
  gulp.watch("less/*.less", ['build-css']);
});

gulp.task('default', build_tasks);
