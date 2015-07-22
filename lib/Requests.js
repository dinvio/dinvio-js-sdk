'use strict';

var superagent = require('superagent');
var Q = require('q');
var stripSlashes = require('./utils/stripSlashes');
var DeferredResult = require('./DeferredResult');

/**
 * Dinvio API Requests module
 * @param {string} apiUrl
 * @param {string|number} version
 * @param {string} publicKey
 * @constructor
 */
function Requests(apiUrl, version, publicKey) {
    this.apiUrl = stripSlashes(apiUrl);
    this.version = version.toString();
    this.publicKey = publicKey;
}

/**
 * @param {string} endpoint
 * @returns {string}
 * @private
 */
Requests.prototype._constructUrl =  function(endpoint) {
    return this.apiUrl + '/v' + this.version + '/' + stripSlashes(endpoint) + '/';
};

/**
 * Make HTTP request to
 * @param {string} method
 * @param {string} endpoint
 * @param {Object} [payload]
 * @returns {Object} Promise object
 */
Requests.prototype.make = function(method, endpoint, payload) {
    var deferred = Q.defer();
    method = method.toLowerCase();
    if (method !== 'get' && method !== 'post') {
        throw new Error('Only GET or POST method allowed');
    }
    var request = superagent[method](this._constructUrl(endpoint))
        .set('X-API-Key', this.publicKey)
        .type('application/json')
        .accept('json');
    if (payload) {
        if (method === 'get') {
            request = request.query(payload);
        } else {
            request.send(payload);
        }
    }
    request.end(function(err, res) {
        if (err) {
            if (err.response) {
                res = err.response;
            } else {
                deferred.reject(err);
                return;
            }
        }
        if (res.ok) {
            deferred.resolve(res.body);
        } else {
            deferred.reject(res.body || res.text);
        }
    });
    return deferred.promise;
};

/**
 * Shortcut to .make('post', endpoint, payload)
 * @param {string} endpoint
 * @param {Object} payload
 * @returns {Object} Promise object
 */
Requests.prototype.post = function(endpoint, payload) {
    return this.make('post', endpoint, payload);
};

/**
 * Shortcut to .make('get', endpoint, payload)
 * @param {string} endpoint
 * @param {Object} payload
 * @returns {Object} Promise object
 */
Requests.prototype.get = function(endpoint, payload) {
    return this.make('get', endpoint, payload);
};

var defaultDeferredSettings = {
    timeout: 500
};
/**
 * Make deferred request (POST + GET for result)
 * @param {string} endpoint
 * @param {Object} [payload]
 * @param {object} [settings]
 * @returns {Object} Promise object
 */
Requests.prototype.deferred = function(endpoint, payload, settings) {
    var deferred = Q.defer();
    var timeout;
    var _this = this;
    settings = settings || {};
    for (var key in defaultDeferredSettings) {
        if (defaultDeferredSettings.hasOwnProperty(key) && !settings.hasOwnProperty(key)) {
            settings[key] = defaultDeferredSettings[key];
        }
    }

    function defer(requestId) {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            _this.get(endpoint, {
                'request_id': requestId
            }).done(good, bad);
        }, settings.timeout);
    }

    function good(response) {
        var result = DeferredResult.fromResponse(response);
        if (result) {
            if (result.isReady) {
                deferred.resolve(result);
            } else {
                defer(result.requestId);
                deferred.notify(result);
            }
        } else {
            deferred.reject(response);
        }
    }
    function bad(reason) {
        deferred.reject(reason);
    }
    this.post(endpoint, payload).done(good, bad);
    return deferred.promise;
};

module.exports = Requests;
