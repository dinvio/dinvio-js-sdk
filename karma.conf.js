'use strict';


module.exports = function(config) {
    config.set({
        frameworks: ['source-map-support', 'sinon', 'jasmine-jquery', 'jasmine'],
        files: [
            'build/js/**/*.js',
            'test/**/*.js',
            {
                pattern: 'build/js/**/*.js.map',
                included: false
            }
        ],
        browsers: ['PhantomJS']
    })
};