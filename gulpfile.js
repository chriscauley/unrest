var riot = require('gulp-riot');
var gulp = require('gulp');
var concat = require("gulp-concat");
var less = require('gulp-less');
var sourcemaps = require("gulp-sourcemaps");
var through = require('through2');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var babel = require('gulp-babel');
var ncp = require('ncp');
var path = require("path");

var PROJECT_NAME = "unrest";

var JS_FILES = {
  unrest: [
    "src/js/*.js",
    "src/js/*.tag",
    "src/js/form/*js",
    "src/js/form/*.tag",
    "src/js/db/*.js",
    "src/js/db/fields/*.js",
    "contrib/nav.tag",
  ],
  canvas: [
    "canvas/index.js",
  ],
  controller: [
    "contrib/controller.js"
  ],
  admin: [
    "contrib/admin/index.js"
  ],
  lunchtime: [
    "lunchtime/lunchtime.js",
  ]
}

var build_tasks = [ 'build-token-js', 'build-token-css', 'build-simplemde', 'cp-static'];
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

var STATIC_DIRS = [
  'lib',
  'demo',
  'lunchtime',
]

var STATIC_FILES = [
  'favicon.ico',
]

gulp.task("cp-static",function() {
  STATIC_DIRS.concat(STATIC_FILES).forEach(function(_dir) {
    var source = path.join(__dirname,_dir);
    var dest = path.join(__dirname, '.dist/',_dir);
    ncp(source, dest)
  });
})

gulp.task('watch', build_tasks, function () {
  for (var key in JS_FILES) {
    gulp.watch(JS_FILES[key], ['build-'+key]);
  }
  for (var key in LESS_FILES) {
    var watch_files = LESS_FILES[key].map((name) => name.match(/.*\//)[0]+"*");
    gulp.watch(watch_files, ['build-'+key+'-css']);
  }

  gulp.watch("token-input/token-input.less", ['build-token-css']);
  gulp.watch("token-input/jquery.tokeninput.js", ['build-token-js']);
  gulp.watch("token-input/token-input.tag", ['build-token-js']);
  gulp.watch("simplemde/simplemde.tag",["build-simplemde"]);
  gulp.watch(STATIC_DIRS.map(d => d+"/**").concat(STATIC_FILES),['cp-static']);
});

gulp.task('default', build_tasks);
