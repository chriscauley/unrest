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
  vendor: ["src/vendor/*.js"],
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
  ],

  // older files I may use again someday
  'token-input': [
    "token-input/zepto.js", // #!TODO: remove zepto dependency
    "token-input/zepto-extra.js",
    "token-input/data.js",
    "token-input/jquery.tokeninput.js",
    "token-input/token-input.tag"
  ],

  simplemde: ["simplemde/simplemde.tag"],
}

JS_FILES.unrest_full = [];

for (var key of ['unrest','canvas','controller','admin','lunchtime']){
  JS_FILES.unrest_full = JS_FILES.unrest_full.concat(JS_FILES[key])
}

var build_tasks = [ 'cp-static'];
for (var key in JS_FILES) { // #! let vs var for maria
  (function(key) {
    build_tasks.push("build-"+key);
    gulp.task('build-'+key, function () {
      if (key == "vendor") { // vendor files are already minified and babel-ifiied
        return gulp.src(JS_FILES[key])
          .pipe(concat(key + '-built.js'))
          .pipe(gulp.dest(".dist/"));
      }
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

  // older files I may use again someday
  token: ["token-input/token-input.less"],
}

LESS_FILES.unrest_full = LESS_FILES.unrest.concat(LESS_FILES.admin);

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

var STATIC_FILES = [
  'lib',
  'demo',
  'lunchtime',
  'favicon.ico',
]

gulp.task("cp-static",function() {
  STATIC_FILES.forEach(function(_dir) {
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
  gulp.watch(STATIC_FILES.map(d => d+"/**"),['cp-static']);
});

gulp.task('default', build_tasks);
