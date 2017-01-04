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
  "url-shim.js",
  "unrest.js",
  "static.js",
  "storage.js",
  "router.js",
  ".dist/_tags.js"
];

gulp.task('build-js', ['build-tag'], function () {
  return gulp.src(js_files)
    .pipe(sourcemaps.init())
    .pipe(concat(PROJECT_NAME + '-built.js'))
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
  return gulp.src("less/base.less")
    .pipe(less({}))
    .pipe(concat(PROJECT_NAME+'-built.css'))
    .pipe(gulp.dest(".dist/"));
});


var token_js = [
  "token-input/zepto.js",
  "token-input/zepto-extra.js",
  "token-input/data.js",
  "token-input/jquery.tokeninput.js",
  ".dist/_token-tag.js",
];

gulp.task('build-token-js', ['build-token-tag'], function () {
  return gulp.src(token_js)
    .pipe(sourcemaps.init())
    .pipe(concat('token-built.js'))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(".dist/"));
});

gulp.task('build-token-tag', function() {
  return gulp.src("token-input/token-input.tag")
    .pipe(riot())
    .pipe(concat("_token-tag.js"))
    .pipe(gulp.dest(".dist"));
});

gulp.task('build-token-css', function () {
  return gulp.src("token-input/token-input.less")
    .pipe(less({}))
    .pipe(concat('token-built.css'))
    .pipe(gulp.dest(".dist/"));
});

var build_tasks = ['build-js', 'build-css', 'build-token-js', 'build-token-css'];
gulp.task('watch', build_tasks, function () {
  gulp.watch("*.js", ['build-js']);
  gulp.watch('*.tag', ['build-js']);
  gulp.watch("less/**/*.less", ['build-css']);

  gulp.watch("token-input/token-input.less", ['build-token-css']);
  gulp.watch("token-input/jquery.tokeninput.js", ['build-token-js']);
  gulp.watch("token-input/token-input.tag", ['build-token-js']);
});

gulp.task('default', build_tasks);
