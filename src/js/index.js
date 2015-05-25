'use strict';

require('es5-shim');

var $ = require('jquery');
var DEFAULTS = require('./defaults');
var Settings = require('./settings');

var Dinvio = {};

var initialized = false;

Dinvio.init = function(settings) {
    if (typeof $ !== 'function') {
        throw ReferenceError('jQuery should be loaded');
    }
    this.settings = new Settings(this, DEFAULTS, settings);

    if (!this.settings.get('publicKey')) {
        throw Error('No publicKey provided in Dinvio.init(...)');
    }
};

Dinvio.is_initialized = function() {
    return initialized;
};


function initialize() {

}


global.Dinvio = Dinvio;
module.exports = Dinvio;
