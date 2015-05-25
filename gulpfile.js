'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var exorcist = require('exorcist');
var watchify = require('watchify');
var browserify = require('browserify');


function bundleJS(b) {
    return b.bundle()
        .pipe(exorcist('./build/js/dinvio.js.map'))
        .pipe(source('dinvio.js'))
        .pipe(gulp.dest('./build/js'));
}


function browserifyJS(watch, debug) {
    /**
     * @type {Browserify}
     */
    var b = browserify(_.assign({}, watchify.args, {
        entries: ['./src/js/index.js'],
        debug: !!debug
    }));
    b.on('log', gutil.log);
    b.on('error', gutil.log.bind(gutil, 'Browserify Error'));
    if (watch) {
        b = watchify(b);
        b.on('update', function() {
            bundleJS(b);
        });
    }
    bundleJS(b);
}


gulp.task('watch-js', function() {
    browserifyJS(true, true);
});

gulp.task('watch', ['watch-js'], function() {

});