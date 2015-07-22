module.exports = function(karma) {
    karma.set({
        frameworks: ['browserify', 'jasmine'],
        files: ['test/**/*.js'],
        preprocessors: {
            'test/**/*.js': ['browserify']
        },
        browsers: ['Chrome'],
        browserify: {
            debug: true
        }
    });
};