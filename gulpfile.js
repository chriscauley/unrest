var riot = require('gulp-riot');
var gulp = require('gulp');
var concat = require("gulp-concat");
var less = require('gulp-less');
var rollup = require('gulp-rollup');
var sourcemaps = require("gulp-sourcemaps");
var through = require('through2');
var uglify = require('gulp-uglify');
var util = require('gulp-util');

var PROJECT_NAME = "unrest";

var js_files = [
  "unrest.js",
  "static.js",
  "storage.js",
  "router.js",
  "slider.js",
  "token-input/jquery.tokeninput.js",
  ".dist/_tags.js"
]

gulp.task('build-js', ['build-tag'], function () {
  return gulp.src(js_files)
    .pipe(sourcemaps.init())
    .pipe(concat(PROJECT_NAME + '-built.js'))
    //.pipe(uglify({mangle: false, compress: false}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(".dist/"));
});
gulp.task('build-tag', function() {
  return gulp.src(["*.tag","token-input/token-input.tag"])
    .pipe(riot())
    .pipe(concat("_tags.js"))
    .pipe(gulp.dest(".dist"));
});

gulp.task('build-css', function () {
  return gulp.src(["less/base.less", "token-input/token-input.less" ])//"static/bfish/**/*.less"])
    .pipe(less({}))
    .pipe(concat(PROJECT_NAME+'-built.css'))
    .pipe(gulp.dest(".dist/"));
});

var build_tasks = ['build-js', 'build-css'];

gulp.task('watch', build_tasks, function () {
  gulp.watch("*.js", ['build-js']);
  gulp.watch("*.tag", ['build-js']);
  gulp.watch("less/**/*.less", ['build-css']);
  gulp.watch("token-input/token-input.less", ['build-css']);
});

gulp.task('default', build_tasks);
