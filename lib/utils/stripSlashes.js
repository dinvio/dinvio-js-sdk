'use strict';

var SLASH_START_RE = /^\//,
    SLASH_STOP_RE = /\/$/;

module.exports = function(str) {
    return str.replace(SLASH_START_RE, '').replace(SLASH_STOP_RE, '');
};
