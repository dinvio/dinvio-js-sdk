
'use strict';

var ALLOWED_KEYS = ['apiUrl', 'version', 'publicKey'];

/**
 *
 * @param {Dinvio} dinvio
 * @param {Object} defaults
 * @param {Object} settings
 * @constructor
 */
function Settings(dinvio, defaults, settings) {
    this._defaults = defaults;
    this._dinvio = dinvio;
    this._dict = {};
    if (typeof settings === 'object') {
        this._update(settings);
    }
}

/**
 * @param {Object} settings
 */
Settings.prototype._update = function (settings) {
    for (var key in settings) {
        if (settings.hasOwnProperty(key) && this._has_key(key, true)) {
            this._dict[key] = settings[key];
        }
    }
};

Settings.prototype._has_key = function (key, verbose) {
    var flag = ALLOWED_KEYS.indexOf(key) > -1;
    if (!flag && verbose) {
        console.warn('Dinvio settings key `' + key + '` unknown');
    }
    return flag;
};

Settings.prototype.get = function (key) {
    if (this._has_key(key, true)) {
        var val = this._dict[key];
        return (val === undefined) ? this._defaults[key] : val;
    } else {
        return undefined;
    }
};


module.exports = Settings;