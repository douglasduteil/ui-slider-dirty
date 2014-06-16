'use strict';

var gulp = require('gulp');

//////////////////////////////////////////////////////////////////////////////
// TASK
//////////////////////////////////////////////////////////////////////////////

gulp.task('default', ['jshint', 'scss', 'karma']);
gulp.task('serve', ['dist', 'continuousMode']);
gulp.task('dist', ['uglify', 'scss']);



//////////////////////////////////////////////////////////////////////////////
// MORE
//////////////////////////////////////////////////////////////////////////////
var karmaHelper = require('node-karma-wrapper');

var lodash = {};
lodash.assign = require('lodash.assign');
lodash.after = require('lodash.after');

//
// ACCESS TO THE ANGULAR-UI-PUBLISHER
// inspired by https://github.com/angular-ui/angular-ui-publisher
function targetTask(argv) {
  var spawn = require('child_process').spawn;

  return function (done) {
    argv = argv || process.argv.slice(2);
    // I'm using the global gulp "" ci ""

    spawn('gulp', argv, {
      cwd: './node_modules/angular-ui-publisher',
      stdio: 'inherit'
    }).on('close', done);
  }
}

gulp.task('build', targetTask());
gulp.task('publish', targetTask());
//
//




//////////////////////////////////////////////////////////////////////////////
// KARMA
//////////////////////////////////////////////////////////////////////////////

var kwjQlite = karmaHelper(testConfig('./test/karma-jqlite.conf.js'));
var kwjQuery = karmaHelper(testConfig('./test/karma-jquery.conf.js'));

function testConfig(configFile, customOptions) {
  var options = { configFile: configFile };
  var travisOptions = process.env.TRAVIS && { browsers: [ 'Firefox', 'PhantomJS'], reporters: ['dots'], singleRun: true  };
  return lodash.assign(options, customOptions, travisOptions);
}


gulp.task('karma', function (cb) {
  var done = lodash.after(2, cb);
  kwjQuery.simpleRun(done);
  kwjQlite.simpleRun(done);
});

gulp.task('karma:jqlite:unit', kwjQlite.simpleRun);
gulp.task('karma:jqlite:watch', function () {
  kwjQlite.inBackground();
  gulp.watch('./test/**', function () {
    kwjQlite.run();
  });
});

gulp.task('karma:jquery:unit', kwjQuery.simpleRun);
gulp.task('karma:jquery:watch', function () {
  kwjQuery.inBackground();
  gulp.watch('./test/**', function () {
    kwjQuery.run();
  });
});



//////////////////////////////////////////////////////////////////////////////
// OTHER
//////////////////////////////////////////////////////////////////////////////
// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('ngmin', function () {
  return gulp.src('*.js', { cwd: './src' })
    .pipe($.changed('./dist'))
    .pipe($.ngmin())
    .pipe(gulp.dest('./dist'));
});

gulp.task('scss', function () {
  return gulp.src('*.scss', { cwd: './src' })
    .pipe($.changed('./dist', { extension: '.css' }))
    .pipe($.plumber({
      errorHandler: function () {
      }
    }))
    .pipe($.rubySass({
      style: 'expanded',
      lineNumbers: true,
      precision: 10
    }))
    .pipe($.autoprefixer("last 1 version", "> 1%", "ie 8"))
    .pipe($.plumber.stop())
    .pipe(gulp.dest('./dist'));
});

var browserSync = require('browser-sync');
function startBs() {
  return browserSync.init(null, {
    server: {
      open: false,
      debounce: 200,
      baseDir: "./out/built/gh-pages/"
    }
  });
}
gulp.task('browser-sync', function () {
  startBs();
});


//////////////////////////////////////////////////////////////////////////////
// LINTING
//////////////////////////////////////////////////////////////////////////////

gulp.task('jshint:src', function (done) {
  return gulp.src('./src/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('jshint:test', function (done) {
  return gulp.src('./test/*.spec.js')
    .pipe($.jshint({
      globals: {
        "angular"    : false,
        "module"    : false,
        "inject"    : false,
        "_jQuery"    : false,
        "browserTrigger"    : false,

        "jasmine"    : false,
        "it"         : false,
        "iit"        : false,
        "xit"        : false,
        "describe"   : false,
        "ddescribe"  : false,
        "xdescribe"  : false,
        "dump"      : false,
        "beforeEach" : false,
        "afterEach"  : false,
        "expect"     : false,
        "spyOn"      : false
      }
    }))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('jshint', ['jshint:src', 'jshint:test']);

//////////////////////////////////////////////////////////////////////////////
// MINIFYING
//////////////////////////////////////////////////////////////////////////////
gulp.task('uglify', ['ngmin'], function () {
  return gulp.src('./dist/*.js')
    .pipe($.changed('./dist'))
    .pipe($.rename({ suffix: '.min'}))
    .pipe($.uglify({mangle: false}))
    .pipe(gulp.dest('./dist'));
});



//////////////////////////////////////////////////////////////////////////////
// CONTINUOUS MODE
//////////////////////////////////////////////////////////////////////////////
gulp.task('continuousMode', function () {
  kwjQuery.inBackground();
  kwjQlite.inBackground();

  gulp.task('_continuousMode:runTests', function (cb) {
    var done = lodash.after(2, cb);
    kwjQuery.run(done);
    kwjQlite.run(done);
  });

  // watch the tests
  gulp.watch('./test/**', ['jshint:test', '_continuousMode:runTests']);

  gulp.watch('./src/**', ['jshint:src', '_continuousMode:runTests']);

});

gulp.task('serve:gh-pages', function () {

  startBs();

  gulp.task('_serve:build-gh-pages', targetTask([ 'build', '--branch=gh-pages' ]));

  gulp.task('_serve:gh-pages', ['_serve:build-gh-pages'], function () {
    return gulp.src('./out/built/gh-pages/**')
      .pipe(browserSync.reload({stream: true, once: true}));
  });

  gulp.watch(['./src/**'], ['dist']);
  gulp.watch(['./dist/**', './demo/**'], $.batch({ debounce: 5000}, function (events) {
    gulp.run('_serve:build-gh-pages');
  }));
  gulp.watch('./out/built/gh-pages/**', $.batch({ debounce: 5000}, function (events) {
    return events
      .pipe(browserSync.reload({stream: true}));
  }));
});
