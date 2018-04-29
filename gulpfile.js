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

var JS_FILES = {
  unrest: [
    "url-shim.js",
    "unrest.js",
    "css.js",
    "static.js",
    "storage.js",
    "router.js",
    "log.tag",
    "lunchtime/lunchtime.js",
    "auth.tag",
    "dialog.tag",
    "math.js",
    "random.js",

    "form.tag",
    "checkbox-input.tag",
    "select-input.tag",
    "pagination.tag",
    //"radio-input.tag",

    "tabs.tag",
    "markdown.tag",
    "multi-file.tag",
    "ez-file.tag",
    "contrib/nav.tag",
    "db/object.js",
    "db/models.js",
    "db/fields/abstract.js",
  ],
  canvas: [
    "canvas/index.js",
  ],
  controller: [
    "contrib/controller.js"
  ],
  admin: [
    "contrib/admin/index.js"
  ]
}

var build_tasks = [ 'build-token-js', 'build-token-css', 'build-simplemde'];
for (var key in JS_FILES) { // #! let vs var for maria
  (function(key) {
    build_tasks.push("build-"+key);
    gulp.task('build-'+key, function () {
      return gulp.src(JS_FILES[key])
        .pipe(sourcemaps.init())
        .pipe(riot())
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(concat(key + '-built.js'))
      //.pipe(uglify({mangle: false, compress: false}))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(".dist/"));
    });
  })(key)
}

LESS_FILES = {
  unrest: ["less/base.less"],
  admin: ["contrib/admin/base.less"],
}

for (var key in LESS_FILES) {
  (function(key) {
    build_tasks.push("build-"+key+"-css");
    gulp.task("build-"+key+"-css", function () {
      return gulp.src(LESS_FILES[key])
        .pipe(less({}))
        .pipe(concat(key+'-built.css'))
        .pipe(gulp.dest(".dist/"));
    });
  })(key);
}

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
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(concat('simplemde-built.js'))
    .pipe(gulp.dest(".dist/"))
})

gulp.task('watch', build_tasks, function () {
  for (var key in JS_FILES) {
    gulp.watch(JS_FILES[key], ['build-'+key]);
  }
  for (var key in LESS_FILES) {
    var watch_files = LESS_FILES[key].map((name) => name.match(/.*\//)[0]);
    gulp.watch(LESS_FILES[key], ['build-'+key+'-css']);
  }

  gulp.watch("token-input/token-input.less", ['build-token-css']);
  gulp.watch("token-input/jquery.tokeninput.js", ['build-token-js']);
  gulp.watch("token-input/token-input.tag", ['build-token-js']);
  gulp.watch("simplemde/simplemde.tag",["build-simplemde"]);
});

gulp.task('default', build_tasks);
