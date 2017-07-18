var riot = require('gulp-riot');
var gulp = require('gulp');
var concat = require("gulp-concat");
var less = require('gulp-less');
var sourcemaps = require("gulp-sourcemaps");
var through = require('through2');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var babel = require('gulp-babel');

var PROJECT_NAME = "unrest";

var JS_FILES = [
  "url-shim.js",
  "unrest.js",
  "static.js",
  "storage.js",
  "router.js",
  "time.js",
  ".dist/_tags.js"
];

gulp.task('build-js', ['build-tag'], function () {
  return gulp.src(JS_FILES)
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(sourcemaps.init())
    .pipe(concat(PROJECT_NAME + '-built.js'))
    //.pipe(uglify({mangle: false, compress: false}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(".dist/"));
});

var TAG_FILES = [
  "auth.tag",
  "dialog.tag",

  "form.tag",
  "checkbox-input.tag",
  "select-input.tag",
  "pagination.tag",
  //"radio-input.tag",

  "tabs.tag",
  "markdown.tag",
  "multi-file.tag",
  "ez-file.tag",
]

gulp.task('build-tag', function() {
  return gulp.src(TAG_FILES)
    .pipe(riot())
    .pipe(concat("_tags.js"))
    .pipe(gulp.dest(".dist"));
});

LESS_FILES = ["less/base.less"];

gulp.task('build-css', function () {
  return gulp.src(LESS_FILES)
    .pipe(less({}))
    .pipe(concat(PROJECT_NAME+'-built.css'))
    .pipe(gulp.dest(".dist/"));
});


var TOKEN_JS_FILES = [
  "token-input/zepto.js",
  "token-input/zepto-extra.js",
  "token-input/data.js",
  "token-input/jquery.tokeninput.js",
  ".dist/_token-tag.js",
];

gulp.task('build-token-js', ['build-token-tag'], function () {
  return gulp.src(TOKEN_JS_FILES)
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

gulp.task('build-simplemde',function() {
  return gulp.src(["simplemde/simplemde.tag"])
    .pipe(riot())
    .pipe(concat('simplemde-built.js'))
    .pipe(gulp.dest(".dist/"))
})

var build_tasks = ['build-js', 'build-css', 'build-token-js', 'build-token-css', 'build-simplemde'];
gulp.task('watch', build_tasks, function () {
  gulp.watch(JS_FILES, ['build-js']);
  gulp.watch(TAG_FILES, ['build-js']);
  gulp.watch(["less/*.less","less/min/*.less","less/materialize/*.less"], ['build-css']);

  gulp.watch("token-input/token-input.less", ['build-token-css']);
  gulp.watch("token-input/jquery.tokeninput.js", ['build-token-js']);
  gulp.watch("token-input/token-input.tag", ['build-token-js']);
  gulp.watch("simplemde/simplemde.tag",["build-simplemde"]);
});

gulp.task('default', build_tasks);
