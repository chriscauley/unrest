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

module.exports = function(opts) {
  var build_tasks = [ 'cp-static'];
  for (var key in opts.js) {
    (function(key) {
      build_tasks.push("build-"+key);
      gulp.task('build-'+key, function () {
        if (key == "vendor") { // vendor files are already minified and babel-ifiied
          return gulp.src(opts.js[key])
            .pipe(concat(key + '-built.js'))
            .pipe(gulp.dest(".dist/"));
        }
        return gulp.src(opts.js[key])
          .pipe(sourcemaps.init())
          .pipe(riot())
          .pipe(babel({ presets: ['es2017'] }))
          .pipe(concat(key + '-built.js'))
          .pipe(sourcemaps.write("."))
          .pipe(gulp.dest(".dist/"));
      });
    })(key)
  }

  for (var key in opts.less) {
    (function(key) {
      build_tasks.push("build-"+key+"-css");
      gulp.task("build-"+key+"-css", function () {
        return gulp.src(opts.less[key])
          .pipe(less({}))
          .pipe(concat(key+'-built.css'))
          .pipe(gulp.dest(".dist/"));
      });
    })(key);
  }

  gulp.task("cp-static",function() {
    opts.static.forEach(function(file_or_directory) {
      var source = path.join(__dirname,file_or_directory);
      var dest = path.join(__dirname, '.dist/',file_or_directory);
      ncp(source, dest);
    });
    opts.renames && opts.renames.forEach(function(r) {
      ncp(path.join(__dirname,r[0]),path.join(DEST,r[1]))
    });
  })

  gulp.task('watch', build_tasks, function () {
    for (var key in opts.js) {
      gulp.watch(opts.js[key], ['build-'+key]);
    }
    for (var key in opts.less) {
      var watch_files = opts.less[key].map((name) => name.match(/.*\//)[0]+"*");
      gulp.watch(watch_files, ['build-'+key+'-css']);
    }
    gulp.watch(opts.static.map(d => d+"/**"),['cp-static']);
  });

  gulp.task('default', build_tasks);
  gulp.task('deploy', build_tasks);
}
