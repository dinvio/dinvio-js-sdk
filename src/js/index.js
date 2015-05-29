'use strict';

require('es5-shim');

var $ = require('jquery');
var DEFAULTS = require('./defaults');
var Settings = require('./settings');
var Requests = require('./requests');
var Events = require('./utils/events');
var Calc = require('./calc');

require('suggestions-jquery');

var Dinvio = {};

var initialized = false;

Events.install(Dinvio);

Dinvio.init = function(settings, callback) {
    if (typeof $ !== 'function') {
        throw ReferenceError('jQuery should be loaded');
    }
    this.settings = new Settings(this, DEFAULTS, settings);

    if (!this.settings.get('publicKey')) {
        throw Error('No publicKey provided in Dinvio.init(...)');
    }

    this.requests = new Requests(this.settings.get('apiUrl'), this.settings.get('version'), this.settings.get('publicKey'));
    this.requests.get('js')
        .done(function(data) {
            initialize(data);
            if (callback) {
                callback.call(Dinvio);
            }
            Dinvio.emit('initialize');
        });
};

Dinvio.is_initialized = function() {
    return initialized;
};

Dinvio.reset = function() {
    initialized = false;
};


function initialize(data) {
    Dinvio.calc = Calc.factory(Dinvio.requests);
    initialized = true;
}


global.Dinvio = Dinvio;
module.exports = Dinvio;
